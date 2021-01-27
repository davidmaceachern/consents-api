export interface IUserData {
  id: string;
  email: string;
  consents: object[]; 
}

export interface IUserResponseArray {
  [index: number]: IUserData;
}

export interface IUserRequestBody {
  email: string
};

export interface User {
  id: string;
  email: string;
  consents: object[];
}