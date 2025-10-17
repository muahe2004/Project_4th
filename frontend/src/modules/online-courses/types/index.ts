export interface ICourses {
    id?: string;
    maKhoaHoc: string;
    tenKhoaHoc: string;
    moTa: string;
    hinhAnh: string;
    doKho: string;
    giaBan: string;
    trangThai: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface ILessons {
    id?: string;
    khoaHocId?: string;
    tenChuong: string;
    trangThai: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface ILectures {
    id?: string;
    chuongHocId?: string;
    tenBaiHoc: string;
    moTaBaiHoc: string;
    video: string;
    trangThai: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface IQuestions {
    id?: string;
    noiDung: string;
    baiHocId: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface IAnswers {
    id?: string;
    cauHoiId: string;
    noiDungDapAn: string;
    laDapAnDung: boolean;
    updatedAt?: string;
    createdAt?: string;
}

export interface QuestionResponse extends IQuestions {
    dapAns: IAnswers[];
}

export interface QuestionListResponse {
    data: QuestionResponse[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
}