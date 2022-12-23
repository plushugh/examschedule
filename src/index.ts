import csv from "csv-parser";
import * as fs from "fs";

interface TestSession {
  examdate: string;
  examtime: string;
  subject: string;
  grade: string;
  classNum: string;
  minutes: string;
  groupChatName: string;
  numberOfPeople: string;
  proctor1: string;
  proctor2: string;
  teacher: string;
  students: string[];
}

export function processFile(inputFilename: string, outputFilename: string) {
  const testSessionsByStudent: { [student: string]: TestSession[] } = {};

  fs.createReadStream(inputFilename, { encoding: "utf-8" })
    .pipe(csv())
    // for each row, add the test session to the student's list of test sessions
    .on("data", (row) => {
      console.log(row);
      const examdate = row["examdate"];
      const examtime = row.examtime;
      const subject = row.subject;
      const grade = row.grade;
      const classNum = row.classnum;
      const minutes = row.minutes;
      const groupChatName = row.group_chat_name;
      const numberOfPeople = row.number_of_people;
      const proctor1 = row.proctor1;
      const proctor2 = row.proctor2;
      const teacher = row.teacher;
      const students = Object.values(row).slice(11); // slice off the first 11 columns to get the student names

      for (const student of <string[]>students) {
        if (!testSessionsByStudent[student]) {
          testSessionsByStudent[student] = [];
        }

        testSessionsByStudent[student].push({
          examdate,
          examtime,
          subject,
          grade,
          classNum,
          minutes,
          groupChatName,
          numberOfPeople,
          proctor1,
          proctor2,
          teacher: teacher.endsWith("、examaffairs@brs.edu.cn")
            ? teacher.slice(0, -23)
            : teacher,
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
        JSON.stringify(testSessionsByStudent, null, 2)
      );
    });
}
