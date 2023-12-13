//Firebase config
#include<WiFi.h>
#include<Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "LAPTOP-EPG6G6HI 8635"
#define WIFI_PASSWORD "12345678"
#define API_KEY "AIzaSyASIzJ4HN0rG6R52DxuiUCv43Cdnyezn6I"
#define DATABASE_URL "https://smart-pot-test-2-default-rtdb.asia-southeast1.firebasedatabase.app/"



FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataprevMillis = 0;
bool signUpOK = false;


//DHT11 headers
#include<Adafruit_Sensor.h>
#include "DHT.h"
#define Type DHT11


//Configure DHT11 Sensor
int sensePin = 4;
DHT HT(sensePin,Type);
int humidity;
int tempC;
int tempF;

//Soil Moisture config
int AirValue = 2898;
int WaterValue = 1128;
int SoilMoistureValue = 0;
int SoilMoisturePercentage = 0;
int SoilPin = 35;


//Light Intensity
#include <BH1750.h>
#include <Wire.h>
BH1750 lightMeter;

//Connection Led
int led_pin = 2;


void setup() {
  //Setup DHT11
  HT.begin();

  //Light Intensity Setup
  Wire.begin();
  lightMeter.begin();

  //Soil Moisture Setup
  pinMode(SoilPin,INPUT);

  Serial.begin(115200);
  //Connection Led setup
  pinMode(led_pin,OUTPUT);
  //Wifi connection setup
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi..");
  while(WiFi.status()!=WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  digitalWrite(led_pin,HIGH);
  Serial.println(WiFi.localIP());
  Serial.println();

  //Config firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if(Firebase.signUp(&config,&auth,"","")){
    Serial.println("SignUp OK");
    signUpOK = true;
  }
  else{
    Serial.printf("%s\n",config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config,&auth);
  Firebase.reconnectWiFi(true);

}

void loop() {
  // put your main code here, to run repeatedly:
  if(Firebase.ready() && signUpOK &&(millis()-sendDataprevMillis>5000||sendDataprevMillis == 0)){
    sendDataprevMillis = millis();
    humidity = HT.readHumidity();
    tempC = HT.readTemperature();
    tempF = HT.readTemperature(true);

    //Soil Moisture Reading
    SoilMoistureValue = averageAnalogRead(SoilPin);
    SoilMoisturePercentage = map(SoilMoistureValue,AirValue,WaterValue,0,100);

    //Light Instensity Reading
    float lux = lightMeter.readLightLevel();
    //Device Connection
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Connection",1)){
      Serial.println();
      Serial.print("True");
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println(" ("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
    //Humidity 
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Humidity",humidity)){
      Serial.println();
      Serial.print(humidity);
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println(" ("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }

    //Temperature C
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Temp/C",tempC)){
      Serial.println();
      Serial.print(tempC);
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
    //Temperature F
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Temp/F",tempF)){
      Serial.println();
      Serial.print(tempF);
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
    //Soil Moisture
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Soil",SoilMoisturePercentage)){
      Serial.println();
      Serial.print(SoilMoisturePercentage);
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
    //Light Intensity
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Light",lux)){
      Serial.println();
      Serial.print(lux);
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println("("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
    //Device Connection
    if(Firebase.RTDB.setInt(&fbdo,"Sensor/Connection",0)){
      Serial.println();
      Serial.print("False");
      Serial.println(" - Sucessfully saved to : " + fbdo.dataPath());
      Serial.println(" ("+fbdo.dataType()+")");
    }
    else{
      Serial.println("FAILED: "+fbdo.errorReason());
    }
  }
  
}

int averageAnalogRead(int pinToRead)
{
  byte numberOfReadings = 8;
  unsigned int runningValue = 0; 
 
  for(int x = 0 ; x < numberOfReadings ; x++)
    runningValue += analogRead(pinToRead);
  runningValue /= numberOfReadings;
 
  return(runningValue);
}
