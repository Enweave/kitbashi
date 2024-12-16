$BUTLER_PATH = "$ENV:AppData\itch\apps\butler\butler.exe"
#$VERSION = git log -1 --format="%h"
$VERSION = "69"

$ITCH_USER = "enweave"
$ITCH_GAME = "kitbashi"
$ITCH_CHANNEL = "web"
$BUILD_DIR = "dist"

echo "uploading to itch.io"

$butlerStartParams = @{
    FilePath     = $BUTLER_PATH
    ArgumentList = "push", $BUILD_DIR, "$ITCH_USER/$ITCH_GAME`:$ITCH_CHANNEL", "--userversion", $VERSION
    Wait         = $true
    PassThru     = $true
}
$proc = Start-Process @butlerStartParams
$proc.ExitCode

echo "Uploading done"