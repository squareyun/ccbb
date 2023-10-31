import * as S from './style';

export default function Input2({ width, height, label, id, type }) {
    return (
      <S.InputBox>
        <S.Inputlabel htmlFor={id}>{label}</S.Inputlabel>
        <S.StyledInput id={id} width={width} height={height} />
      </S.InputBox>
    );
  }
