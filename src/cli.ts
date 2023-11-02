import { parse } from "https://deno.land/std@0.192.0/csv/mod.ts";

interface TestSession {
  examDate: string;
  examTime: string;
  subject: string;
  grade: string;
  classNum: string;
  minutes: string;
  location: string;
  proctor1: string;
  proctor2: string | null;
  numOfStudents: string;
  students: string[];
}

export async function processFile(
  inputFilename: string,
  outputFilename: string,
  studentNamesListOutputFilename: string
) {
  const testSessionsByStudent: Record<string, TestSession[]> = {};

  try {
    const file = await Deno.readTextFile(inputFilename);
    const csv = parse(file, { trimLeadingSpace: true, skipFirstRow: true }); // Skip the first row of the CSV file (headers) and trim leading spaces, the first row will then be used as the keys for the returned object

    for await (const row of csv) {
      const {
        examDate,
        grade,
        examTime,
        subject,
        classNum,
        minutes,
        location,
        proctor1,
        proctor2,
        numOfStudents,
        ...students
      } = row;

      const studentNames: string[] = Object.values(students).filter(
        Boolean
      ) as string[];

      studentNames.forEach((student) => {
        if (!testSessionsByStudent[student]) {
          testSessionsByStudent[student] = [];
        }

        testSessionsByStudent[student].push({
          examDate: examDate || "INVALID DATE",
          examTime: examTime || "INVALID TIME",
          subject: subject || "INVALID SUBJECT",
          grade: grade || "INVALID GRADE",
          classNum: classNum || "INVALID CLASS NUMBER",
          minutes: minutes || "INVALID MINUTES",
          location: location || "INVALID LOCATION",
          proctor1: proctor1 || "INVALID PROCTOR",
          proctor2: proctor2 || null,
          numOfStudents: numOfStudents || "INVALID NUMBER OF STUDENTS",
          students: studentNames,
        });
      });
    }

    // const jsonData = JSON.stringify(testSessionsByStudent, null, 2);
    const jsonData = JSON.stringify(testSessionsByStudent); // Saves precious bytes

    const studentList = Object.keys(testSessionsByStudent).sort().join("\n");

    Deno.writeTextFile(studentNamesListOutputFilename, studentList);

    Deno.writeTextFile(outputFilename, jsonData);
  } catch (error) {
    console.error(error);
  }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFilename = Deno.args[0];
  const outputFilename = Deno.args[1];
  const studentNamesListOutputFilename = Deno.args[2];

  if (!inputFilename || !outputFilename || !studentNamesListOutputFilename) {
    console.error(
      "Please provide an input and output filenames. Example: deno run --allow-read --allow-write src/cli.ts input.csv public/testSessionsByStudent.json public/studentNamesList.txt"
    );
    Deno.exit(1);
  }

  await processFile(
    inputFilename,
    outputFilename,
    studentNamesListOutputFilename
  );
}
