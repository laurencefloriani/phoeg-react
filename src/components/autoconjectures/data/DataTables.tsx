import MainContext from "../../../store/utils/main_context";
import { useContext } from "react";
import { Grid } from "@mui/material";
import TableDirection from "./TableDirection";
import { ConcavesRefactoredProps } from "./MyTabs";

const DataTables = ({ concavesRefactored }: ConcavesRefactoredProps) => {
  const mainContext = useContext(MainContext);

  const keys = Object.keys(concavesRefactored);

  return (
    <Grid container spacing={1}>
      {keys.map((key) => {
        return (
          <Grid item xs={4} key={`table-${key}`}>
            <TableDirection title={key} data={concavesRefactored[key]} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DataTables;
