// 소문자 (아두이노와 동일하게 입력)
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"; 
const WRITE_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"; 
let writeChar, statusP, connectBtn, send1Btn, send2Btn, send3Btn;
let circleColor;

// 가속도 센서 관련 변수
let accelBtn, accelP;
let ballX, ballY;
let ballVX = 0, ballVY = 0;
let accelX = 0, accelY = 0, accelZ = 0;
let accelEnabled = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  circleColor = color(255, 255, 255); // 초기 색상: 흰색
  
  // 파란색 공의 초기 위치 (중앙)
  ballX = width / 2;
  ballY = height / 2;

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

  // 가속도 센서 활성화 버튼
  accelBtn = createButton("Enable Accelerometer");
  accelBtn.mousePressed(enableAccelerometer);
  accelBtn.size(180, 30);
  accelBtn.position(20, 180);

  // 가속도 센서값 표시
  accelP = createP("Accelerometer: Not activated");
  accelP.position(22, 200);
}

function draw() {
  background(220);
  
  // 중앙에 크기 200인 원 그리기 (RGB 변경용)
  fill(circleColor);
  noStroke();
  circle(width / 2, height / 2, 200);

  // 가속도 센서가 활성화된 경우 공 업데이트
  if (accelEnabled) {
    // 가속도 값을 화면에 표시
    accelP.html(`Accelerometer: X=${accelX.toFixed(2)}, Y=${accelY.toFixed(2)}, Z=${accelZ.toFixed(2)}`);
    
    // 가속도에 따라 속도 변경 (스케일 조정)
    ballVX += accelX * 0.5;
    ballVY += accelY * 0.5;
    
    // 마찰력 적용
    ballVX *= 0.98;
    ballVY *= 0.98;
    
    // 위치 업데이트
    ballX += ballVX;
    ballY += ballVY;
    
    // 캔버스 경계에서 튕기기
    if (ballX < 10 || ballX > width - 10) {
      ballVX *= -0.8;
      ballX = constrain(ballX, 10, width - 10);
    }
    if (ballY < 10 || ballY > height - 10) {
      ballVY *= -0.8;
      ballY = constrain(ballY, 10, height - 10);
    }
  }
  
  // 지름 20인 파란색 원 그리기
  fill(0, 0, 255);
  noStroke();
  circle(ballX, ballY, 20);
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

// ---- 가속도 센서 활성화 ----
async function enableAccelerometer() {
  // iOS 13+ 권한 요청
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission === 'granted') {
        window.addEventListener('devicemotion', handleMotion);
        accelEnabled = true;
        accelP.html("Accelerometer: Activated");
      } else {
        accelP.html("Accelerometer: Permission denied");
      }
    } catch (error) {
      accelP.html("Accelerometer: Error - " + error);
    }
  } else {
    // 안드로이드나 구형 iOS는 권한 요청 없이 바로 사용
    window.addEventListener('devicemotion', handleMotion);
    accelEnabled = true;
    accelP.html("Accelerometer: Activated");
  }
}

// ---- 가속도 센서 데이터 처리 ----
function handleMotion(event) {
  if (event.accelerationIncludingGravity) {
    accelX = event.accelerationIncludingGravity.x || 0;
    accelY = event.accelerationIncludingGravity.y || 0;
    accelZ = event.accelerationIncludingGravity.z || 0;
  }
}
