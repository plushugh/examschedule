# Usage

## Delete header rows in excel
## Spread merged cells using VBA script

1. Alt + F11
2. Insert > Module
3. Add this script
```vba
Sub UnMergeSameCell()
'Upadateby Extendoffice
Dim Rng As Range, xCell As Range
xTitleId = "KutoolsforExcel"
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
4. Select all cells
5. Use F5 to run the script
6. Export csv

# Open csv and add column names
1. Open csv in textedit
2. add this to an extra top line:

```
examdate,examtime,subject,classnum,minutes,location,proctor1,proctor2,number_of_people,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15,s16,s17,s18,s19,s20,s21,s22,s23,s24,s25,s26,s27,s28,s29,s30,s31,s32,s33,s34,s35,s36,s37,s38,s39,s40,s41,s42,s43,s44,s45
```

3. rename csv as test.csv and copy to this folder

## Strip BOM from csv file
### note input file is named `test.csv`
```bash
npm install
npm run strip-bom
```

## Generate preindexed json
```bash
npm run generate testbom.csv public/testSessionsByStudent.json
```

## Deploy webapp from `public/` directory
Netlify
