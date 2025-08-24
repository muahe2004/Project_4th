export default function getGradeColor(grade: string) {
    switch (grade) {
        case "A+":
        case "A":
        case "A-":
        case "Xuất sắc":
            return "grades-a";
        case "B+":
        case "B":
        case "Giỏi":
            return "grades-b";
        case "C":
        case "C+":
        case "Khá":
            return "grades-c";
        case "D+":
        case "D":
        case "Trung bình":
            return "grades-d";
        case "Yếu":
        case "F":
            return "grades-f";
        default:
            return "inherit";
    }
}