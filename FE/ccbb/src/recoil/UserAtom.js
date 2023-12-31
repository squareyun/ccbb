/* eslint-disable import/no-extraneous-dependencies */
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist();

export const userState = atom({
  key: "user",
  default: {
    userId: null,
    point: 0,
    email: "",
    name: "",
    nickname: "",
    profileImg: null,
    social: "",
    lol: "",
  },
  effects_UNSTABLE: [persistAtom],
});
