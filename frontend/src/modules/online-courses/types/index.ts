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