const { spawn } = require("child_process");

let tunnelProcess = null;

function startTunnel(port) {
  return new Promise((resolve, reject) => {
    tunnelProcess = spawn("cloudflared", [
      "tunnel",
      "--url",
      `http://localhost:${port}`,
    ]);

    let resolved = false;
    let tunnelUrl = null;
    let registered = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error("cloudflared 터널 시작 타임아웃 (30초)"));
      }
    }, 30000);

    function tryResolve() {
      if (tunnelUrl && registered && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        // DNS 전파 대기
        setTimeout(() => resolve(tunnelUrl), 3000);
      }
    }

    function handleData(data) {
      const output = data.toString();

      if (!tunnelUrl) {
        const match = output.match(
          /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/
        );
        if (match) {
          tunnelUrl = match[0];
        }
      }

      if (output.includes("Registered tunnel connection")) {
        registered = true;
      }

      tryResolve();
    }

    tunnelProcess.stdout.on("data", handleData);
    tunnelProcess.stderr.on("data", handleData);

    tunnelProcess.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        if (err.code === "ENOENT") {
          reject(
            new Error(
              "cloudflared가 설치되어 있지 않습니다. `brew install cloudflared`로 설치해주세요."
            )
          );
        } else {
          reject(new Error(`cloudflared 실행 실패: ${err.message}`));
        }
      }
    });

    tunnelProcess.on("close", (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`cloudflared가 코드 ${code}로 종료되었습니다.`));
      }
    });
  });
}

function stopTunnel() {
  if (tunnelProcess) {
    tunnelProcess.kill();
    tunnelProcess = null;
  }
}

module.exports = { startTunnel, stopTunnel };
