import styled from "styled-components";

export const StyledInput = styled.textarea`
  border-bottom: 1px solid #ccc;  
  padding: 10px;         
  width: 100%;
  height: 90px;
  box-sizing: border-box;
  font-size: 20px;
  border-radius: 5px;
  resize: none;
`;

export const Inputlabel = styled.label`
    color: black;
    padding-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
`

export const InputBox = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 0;
`