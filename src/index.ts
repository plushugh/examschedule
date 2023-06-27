import csv from "csv-parser";
import * as fs from "fs";

interface TestSession {
  examdate: string;
  examtime: string;
  subject: string;
  minutes: string;
  location: string;
  numberOfPeople: string;
  proctor1: string;
  proctor2: string;
  students: string[];
}

export function processFile(inputFilename: string, outputFilename: string) {
  const testSessionsByStudent: { [student: string]: TestSession[] } = {};

  fs.createReadStream(inputFilename, { encoding: "utf-8" })
    .pipe(csv())
    // for each row, add the test session to the student's list of test sessions
    .on("data", (row) => {
      const examdate = row["examdate"];
      const examtime = row.examtime;
      const subject = row.subject;
      const minutes = row.minutes;
      const location = row.location;
      const numberOfPeople = row.number_of_people;
      const proctor1 = row.proctor1;
      const proctor2 = row.proctor2;
      const students = Object.values(row).slice(9); // slice off the first 11 columns to get the student names

      for (const student of <string[]>students) {
        if (!testSessionsByStudent[student]) {
          testSessionsByStudent[student] = [];
        }

        testSessionsByStudent[student].push({
          examdate,
          examtime,
          subject,
          location,
          minutes,
          numberOfPeople,
          proctor1,
          proctor2,
          students: <string[]>(
            students.filter((str: string) => str.trim() !== "")
          ),
        });
      }
    })
    .on("end", () => {
      // output it as a JSON file
      fs.writeFileSync(
        outputFilename,
        // JSON.stringify(testSessionsByStudent, null, 2)
        JSON.stringify(testSessionsByStudent) // saves bytes
      );
    });
}
