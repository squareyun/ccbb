import styled from "styled-components";
import { theme } from "./styles/Theme";

export const main = styled.main`
  background-color: ${theme.mainbg};
  width: auto;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;
