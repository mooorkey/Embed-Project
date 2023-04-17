#include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>

const int RX_PIN = 0;
const int TX_PIN = 1;

SoftwareSerial mySerial(RX_PIN, TX_PIN);

LiquidCrystal_I2C lcd(0x3F, 16, 2);

float testWeightData = 1.23;

void setup() {
  // put your setup code here, to run once:
  /* init serial */
  Serial.begin(115200);
  mySerial.begin(115200);

  /* init LCD */
  lcd.init();
  lcd.clear();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello World");
  lcd.setCursor(2, 1);
  lcd.print("LCD Initialized");
  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Waiting For Data..");
  while (!Serial.available());
  lcd.clear();
}

void loop() {
  if (mySerial.available()) {
    Serial.print("Message Received: ");
    //String Raw = mySerial.readString();
    String dataw = mySerial.readStringUntil(',');
    float weight = dataw.toFloat();
    String datahr = mySerial.readString();
    float hr = datahr.toFloat();
    Serial.println(dataw + " " + datahr);
    updateBag(weight);
    updateHr(hr);
    //updateStatus(weight);
  }
  delay(100);
}

void lcd_print(int row, int col, String msg) {
  lcd.setCursor(col, row);
  lcd.print(msg);
  for (int i = col + msg.length(); i < 16; i++) {  // Assuming 16 characters per row
    lcd.print(" ");
  }
}



void updateBag(float weight) {
  lcd_print(0, 0, "IVWeight:" + String(weight) + "g");
}

void updateHr(float hr) {
  lcd_print(1, 0, "Hr:" + String(hr) + "bpm");
}

void updateStatus(float weight) {
  if (weight < 25) {
    lcd_print(1, 0, "Status: Low");
  } else {
    lcd_print(1, 0, "Status: Normal");
  }
}
