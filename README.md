# Examschedule

Look up your test schedules without pain

## Usage

Deployed on Netlify: https://exam.plushugh.com/

## Building from source

### Prerequisites

- Deno >= 1.34.0

#### Delete header rows in excel

#### Spread merged cells using VBA script

1. Alt + F11
2. Insert > Module
3. Add this script

```vba
Sub UnMergeSameCell()
Dim Rng As Range, xCell As Range
xTitleId = "Select Cells to unmerge"
Set WorkRng = Application.Selection
Set WorkRng = Application.InputBox("Range", xTitleId, WorkRng.Address, Type:=8)
Application.ScreenUpdating = False
Application.DisplayAlerts = False
For Each Rng In WorkRng
    If Rng.MergeCells Then
        With Rng.MergeArea
            .UnMerge
            .Formula = Rng.Formula
        End With
    End If
Next
Application.DisplayAlerts = True
Application.ScreenUpdating = True
End Sub
```

<!-- credit: Extendoffice -->

1. Select all cells in sheet
2. Use F5 to run the script (or run and choose all cells in VBA editor)
3. Export csv as `test.csv`

#### Open csv and add column names

1. Open csv in textedit
2. add this to an extra topmost line:

```csv
examDate,examTime,subject,grade,classNum,minutes,location,proctor1,proctor2,numOfStudents,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15,s16,s17,s18,s19,s20,s21,s22,s23,s24,s25,s26,s27,s28,s29,s30,s31,s32,s33,s34,s35,s36,s37,s38,s39,s40,s41,s42,s43,s44,s45,s46,s47,s48,s49,s50,s51,s52,s53,s54
```

1. rename csv as `input.csv` and copy to this folder

#### Generate preindexed json

```bash
npm run generate-json

# or

deno run --allow-read --allow-write src/cli.ts input.csv public/testSessionsByStudent.json public/studentNamesList.txt
```

> this npm script reads `input.csv` and generates a new file in `public/` as `testSessionsByStudent.json` and
> a `studentNamesList.txt`

#### Deploy webapp from `public/` directory

Use netlify, since this app uses netlify forms for form collection.
