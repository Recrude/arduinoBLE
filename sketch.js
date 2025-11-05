// 소문자 (아두이노와 동일하게 입력)
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"; 
const WRITE_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"; 
let writeChar, statusP, connectBtn, send1Btn, send2Btn, send3Btn;
let circleColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  circleColor = color(255, 255, 255); // 초기 색상: 흰색

  // BLE 연결
  connectBtn = createButton("Scan & Connect");
  connectBtn.mousePressed(connectAny);
  connectBtn.size(120, 30);
  connectBtn.position(20, 40);

  statusP = createP("Status: Not connected");
  statusP.position(22, 60);

  // Send 버튼들
  send1Btn = createButton("Send 1");
  send1Btn.mousePressed(() => {
    sendNumber(1);
    circleColor = color(255, 0, 0); // 빨강
  });
  send1Btn.size(80, 30);
  send1Btn.position(20, 120);

  send2Btn = createButton("Send 2");
  send2Btn.mousePressed(() => {
    sendNumber(2);
    circleColor = color(0, 255, 0); // 초록
  });
  send2Btn.size(80, 30);
  send2Btn.position(110, 120);

  send3Btn = createButton("Send 3");
  send3Btn.mousePressed(() => {
    sendNumber(3);
    circleColor = color(0, 0, 255); // 파랑
  });
  send3Btn.size(80, 30);
  send3Btn.position(200, 120);
}

function draw() {
  background(220);
  
  // 중앙에 크기 200인 원 그리기
  fill(circleColor);
  noStroke();
  circle(width / 2, height / 2, 200);
}

// ---- BLE Connect ----
async function connectAny() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID],
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    writeChar = await service.getCharacteristic(WRITE_UUID);
    statusP.html("Status: Connected to " + (device.name || "device"));
  } catch (e) {
    statusP.html("Status: Error - " + e);
    console.error(e);
  }
}

// ---- Write 1 byte to BLE ----
async function sendNumber(n) {
  if (!writeChar) {
    statusP.html("Status: Not connected");
    return;
  }
  try {
    await writeChar.writeValue(new Uint8Array([n & 0xff]));
    statusP.html("Status: Sent " + n);
  } catch (e) {
    statusP.html("Status: Write error - " + e);
  }
}
