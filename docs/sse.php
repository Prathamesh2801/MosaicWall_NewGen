<?php
header('Access-Control-Allow-Origin: *');

$dataFile   = __DIR__ . '/data.json';
$uploadDir  = __DIR__ . '/uploads';
$uploadUrlBase = 'uploads';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

/**
 * Run $callback($data) with an exclusive lock on data.json.
 * $data is the decoded array (empty array if file is missing/invalid).
 * If $callback returns a non-null value, it is written back as the new contents.
 * Returns whatever $callback returned.
 */
function withDataLock(string $dataFile, callable $callback)
{
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
    }

    $fp = fopen($dataFile, 'c+');
    if (!$fp) {
        throw new RuntimeException('Unable to open data.json');
    }

    flock($fp, LOCK_EX);

    $contents = stream_get_contents($fp);
    $data = json_decode($contents, true);
    if (!is_array($data)) {
        $data = [];
    }

    $result = $callback($data);

    if ($result !== null) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        fflush($fp);
    }

    flock($fp, LOCK_UN);
    fclose($fp);

    return $result;
}

function fullUrlFor(string $relativePath): string
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseDir  = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');

    return $protocol . $host . $baseDir . '/' . ltrim($relativePath, '/');
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    handleUpload($dataFile, $uploadDir, $uploadUrlBase);
} elseif ($method === 'GET') {
    handleSse($dataFile);
} elseif ($method === 'OPTIONS') {
    exit; // For CORS preflight requests
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method not allowed']);
}

function handleUpload(string $dataFile, string $uploadDir, string $uploadUrlBase): void
{
    header('Content-Type: application/json');

    if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid image uploaded. Use form field name "image".']);
        return;
    }

    $file = $_FILES['image'];

    // Trust the real content, not the client's filename (the app always sends "photo.jpg").
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);

    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime])) {
        http_response_code(400);
        $isHeic = in_array($mime, ['image/heic', 'image/heif'], true);
        echo json_encode(['error' => $isHeic
            ? 'HEIC photos are not supported. Set iPhone Camera > Formats to "Most Compatible" and try again.'
            : 'Uploaded file is not a valid image.']);
        return;
    }

    $filename     = uniqid('img_', true) . '.' . $extensions[$mime];
    $destination  = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file.']);
        return;
    }

    $fullUrl = fullUrlFor($uploadUrlBase . '/' . $filename);

    $record = [
        'id'         => uniqid('', true),
        'url'        => $fullUrl,
        'sse_status' => false,
    ];

    withDataLock($dataFile, function (array $data) use ($record) {
        $data[] = $record;
        return $data;
    });

    http_response_code(201);
    echo json_encode(['success' => true, 'data' => $record]);
}

function handleSse(string $dataFile): void
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    ini_set('output_buffering', 'off');
    ini_set('zlib.output_compression', '0');
    set_time_limit(0);

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    // Newest connection owns delivery. A dropped client's loop can keep running (the server often
    // never reports the abort) and would mark images sent into a dead socket; it now sees it lost
    // ownership and exits. Claimed and checked under the data.json lock, so no image slips between.
    $ownerFile = __DIR__ . '/sse_owner.txt';
    $me = uniqid('', true);
    withDataLock($dataFile, function () use ($ownerFile, $me) {
        file_put_contents($ownerFile, $me);
        return null;
    });
    $isOwner = fn () => @file_get_contents($ownerFile) === $me;

    while (true) {
        if (connection_aborted()) {
            break;
        }

        $pendingIds = [];
        $owner = true;
        withDataLock($dataFile, function (array $data) use (&$pendingIds, &$owner, $isOwner) {
            if (!($owner = $isOwner())) {
                return null;
            }
            foreach ($data as $item) {
                if (($item['sse_status'] ?? true) === false) {
                    $pendingIds[] = $item['id'];
                }
            }
            return null;
        });

        if (!$owner) {
            break;
        }

        if (empty($pendingIds)) {
            echo ": keep-alive\n\n";
            flush();
            sleep(2);
            continue;
        }

        foreach ($pendingIds as $id) {
            $sentItem = withDataLock($dataFile, function (array $data) use ($id, &$owner, $isOwner) {
                if (!($owner = $isOwner())) {
                    return null;
                }
                foreach ($data as $idx => $item) {
                    if ($item['id'] === $id && ($item['sse_status'] ?? true) === false) {
                        $data[$idx]['sse_status'] = true;
                        return $data;
                    }
                }
                return null;
            });

            if (!$owner) {
                break 2;
            }
            if ($sentItem === null) {
                continue;
            }

            foreach ($sentItem as $item) {
                if ($item['id'] === $id) {
                    echo "event: image\n";
                    echo 'data: ' . json_encode(['id' => $item['id'], 'url' => $item['url']]) . "\n\n";
                    flush();
                    break;
                }
            }

            if (connection_aborted()) {
                // The write didn't reach the wall: put the image back so the next connection gets it.
                withDataLock($dataFile, function (array $data) use ($id) {
                    foreach ($data as $idx => $item) {
                        if ($item['id'] === $id) {
                            $data[$idx]['sse_status'] = false;
                            return $data;
                        }
                    }
                    return null;
                });
                break 2;
            }
        }

        sleep(1);
    }
}
