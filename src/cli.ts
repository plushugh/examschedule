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
    outputFilenameProctor: string,
    studentNamesListOutputFilename: string,
    proctorNamesListOutputFilename: string
) {
    const testSessionsByStudent: Record<string, TestSession[]> = {};
    const testSessionsByProctor: Record<string, TestSession[]> = {};

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

            const proctors1 =
                (proctor1 as string).trim().split("、").map((i) => i.split("\n")).flat().map(i => i.trim());

            const proctorsRaw = [...proctors1, ...(proctor2 as string).trim().split("、").map((i) => i.split("\n")).flat().map(i => i.trim())]

            const proctors = [...new Set(proctorsRaw)];

            proctors.forEach(proctor => {
                if (!testSessionsByProctor[proctor]) {
                    testSessionsByProctor[proctor] = [];
                }

                testSessionsByProctor[proctor].push({
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
                })
            })

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

        // const dedup = Object.fromEntries(Object.entries(testSessionsByProctor).map(([proc, sesss]) => [proc, [...new Set(sesss)]]));
        // merge test sessions for each proctor by same date an time
        const dedup: Record<string, TestSession[]> = {};
        Object.entries(testSessionsByProctor).forEach(([proc, sesss]) => {
            const deduped = sesss.reduce((acc, curr) => {
                const key = `${curr.examDate}-${curr.examTime}`;
                if (!acc[key]) {
                    acc[key] = curr;
                } else {
                    acc[key].students = [...acc[key].students, ...curr.students];
                    if (acc[key].subject !== curr.subject) {
                        acc[key].subject = [...new Set([...acc[key].subject.split(","), ...curr.subject.split(",")])].join(",");
                    }
                    acc[key].classNum = [...new Set([...acc[key].classNum.split(","), ...curr.classNum.split(",")])].join(",");
                    acc[key].numOfStudents = [...new Set([...acc[key].numOfStudents.split(","), ...curr.numOfStudents.split(",")])].join(",");
                }
                return acc;
            }, {} as Record<string, TestSession>);

            dedup[proc] = Object.values(deduped);
        });

        // const jsonData = JSON.stringify(testSessionsByStudent, null, 2);
        const jsonData = JSON.stringify(testSessionsByStudent); // Saves precious bytes
        const jsonDataProctor = JSON.stringify(dedup); // Saves precious bytes

        const studentList = Object.keys(testSessionsByStudent).sort().join("\n");
        const proctorList = Object.keys(dedup).sort().join("\n");

        Deno.writeTextFile(studentNamesListOutputFilename, studentList);
        Deno.writeTextFile(proctorNamesListOutputFilename, proctorList);

        Deno.writeTextFile(outputFilename, jsonData);
        Deno.writeTextFile(outputFilenameProctor, jsonDataProctor);
    } catch (error) {
        console.error(error);
    }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
    const inputFilename = Deno.args[0];
    const outputFilename = Deno.args[1];
    const studentNamesListOutputFilename = Deno.args[2];
    const outputFilenameProctor = Deno.args[3];
    const proctorNamesListOutputFilename = Deno.args[4];

    if (!inputFilename || !outputFilename || !studentNamesListOutputFilename || !outputFilenameProctor || !proctorNamesListOutputFilename) {
        console.error(
            "Please provide an input and output filenames. Example: deno run --allow-read --allow-write src/cli.ts input.csv public/testSessionsByStudent.json public/studentNamesList.txt public/testSessionsByProctor.json public/proctorNamesList.txt"
        );
        Deno.exit(1);
    }

    await processFile(
        inputFilename,
        outputFilename,
        outputFilenameProctor,
        studentNamesListOutputFilename,
        proctorNamesListOutputFilename
    );
}
