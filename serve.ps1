$port = 3001
$localPath = "D:\swayhouse.in"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Output "Static server started successfully. Open your browser to http://localhost:$port/"
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/") { $urlPath = "/index.html" }
            # Decode URL spaces, etc.
            $urlPath = [uri]::UnescapeDataString($urlPath)
            
            # Prevent directory traversal
            if ($urlPath.Contains("..")) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }
            
            $filePath = Join-Path $localPath $urlPath
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                  ".html" { "text/html; charset=utf-8" }
                  ".css" { "text/css; charset=utf-8" }
                  ".js" { "application/javascript; charset=utf-8" }
                  ".jpg" { "image/jpeg" }
                  ".jpeg" { "image/jpeg" }
                  ".png" { "image/png" }
                  ".svg" { "image/svg+xml" }
                  ".json" { "application/json; charset=utf-8" }
                  default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
            } else {
                $response.StatusCode = 404
                $errorMessage = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentType = "text/plain"
                $response.ContentLength64 = $errorMessage.Length
                $response.OutputStream.Write($errorMessage, 0, $errorMessage.Length)
            }
            $response.Close()
        } catch {
            Write-Error $_.Exception.Message
        }
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Stop()
}
