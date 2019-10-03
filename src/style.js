import styled from 'styled-components';
import { Box } from 'grommet';

export const HeaderContainer = styled(Box)`
  position: relative;
`;

export const CopyButton = styled(Box)`
  position: absolute;
  top: 16px;
  width: 50px;
  height: 50px;
  right: 0;
  visibility: visible;

  @media only screen and (min-width: ${props => props.breakpoint}) {
    top: 26px;
    left: -50px;
    visibility: hidden;
    &:hover {
      visibility: visible;
    }
    ${HeaderContainer} :hover & {
      visibility: visible;
    }
}
`;
