#include <Adafruit_Fingerprint.h>
#include <SoftwareSerial.h>

SoftwareSerial mySerial(2, 3); 
Adafruit_Fingerprint finger(&mySerial);

void setup() {
  Serial.begin(9600);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor ready");
  } else {
    Serial.println("Fingerprint sensor not found :(");
    while (1);
  }

  printMenu();
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input == "1") {
      Serial.println("Enter ID to enroll (e.g. 3):");
      while (!Serial.available());
      int id = Serial.readStringUntil('\n').toInt();
      enrollFingerprint(id);
    } 
    else if (input == "2") {
      Serial.println("Enter ID to delete (e.g. 3):");
      while (!Serial.available());
      int id = Serial.readStringUntil('\n').toInt();
      deleteFingerprint(id);
    } 
    else if (input == "3") {
      searchFingerprint();
    } 
    else {
      Serial.println("Invalid input. Try again.");
    }

    delay(1000);
    printMenu();
  }
}

void printMenu() {
  Serial.println("\nSelect an option:");
  Serial.println("1. Enroll Fingerprint");
  Serial.println("2. Delete Fingerprint");
  Serial.println("3. Search Fingerprint");
}

void enrollFingerprint(int id) {
  Serial.print("Enrolling ID #");
  Serial.println(id);
  Serial.println("Place finger on sensor...");

  while (finger.getImage() != FINGERPRINT_OK);
  if (finger.image2Tz(1) != FINGERPRINT_OK) {
    Serial.println("Failed to convert image");
    return;
  }

  Serial.println("Remove finger...");
  delay(2000);

  Serial.println("Place the same finger again...");
  while (finger.getImage() != FINGERPRINT_OK);
  if (finger.image2Tz(2) != FINGERPRINT_OK) {
    Serial.println("Failed to convert image (2nd try)");
    return;
  }

  if (finger.createModel() != FINGERPRINT_OK) {
    Serial.println("Could not create fingerprint model");
    return;
  }

  if (finger.storeModel(id) == FINGERPRINT_OK) {
    Serial.println("Fingerprint enrolled successfully!");
  } else {
    Serial.println("Failed to store fingerprint");
  }
}

void deleteFingerprint(int id) {
  if (finger.deleteModel(id) == FINGERPRINT_OK) {
    Serial.print("Fingerprint ID ");
    Serial.print(id);
    Serial.println(" deleted.");
  } else {
    Serial.println("Failed to delete fingerprint");
  }
}

void searchFingerprint() {
  Serial.println("Place finger to search...");

  
  while (true) {
    uint8_t result = finger.getImage();
    if (result == FINGERPRINT_OK) {
      break;  
    } else if (result == FINGERPRINT_NOFINGER) {
     
      delay(200);
    } else {
      Serial.println("Error reading finger");
      return;
    }
  }

  if (finger.image2Tz() != FINGERPRINT_OK) {
    Serial.println("Failed to convert image");
    return;
  }

  if (finger.fingerSearch() == FINGERPRINT_OK) {
    Serial.print("Fingerprint matched! ID: ");
    Serial.println(finger.fingerID);
  } else {
    Serial.println("Fingerprint not found.");
  }
}

