export interface IRoom {
  id?: string;
  room_number: number;
  type: string;
  seats: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomQueryParams {
  limit: number;
  skip: number;
  status?: string;
  search?: string;
}

export interface RoomListResponse {
  total: number;
  data: IRoom[];
}

export interface RoomCreatePayload {
  room_number: number;
  type: string;
  seats: number;
  status: string;
}

export interface RoomUpdatePayload {
  room_number: number;
  type: string;
  seats: number;
  status: string;
  updated_at?: string;
}

export interface RoomDeleteResponse {
  id: string;
  message: string;
}
