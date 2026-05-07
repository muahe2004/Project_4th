import { useNavigate } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";

import type { IAdvisorClassItem } from "../apis/getAdvisorClass";
import { advisorClassScoreUrl } from "../../../routes/urls";

import "./styles/AdvisorClass.css";

interface AdvisorClassProps {
  rows?: IAdvisorClassItem[];
  onViewClass?: (row: IAdvisorClassItem) => void;
}

export function AdvisorClass({ rows, onViewClass }: AdvisorClassProps) {
  const navigate = useNavigate();

  const handleViewClass = (row: IAdvisorClassItem) => {
    console.log("advisor class click", { class_id: row.id });
    onViewClass?.(row);
    navigate(`/${advisorClassScoreUrl}`, {
      state: {
        classId: row.id,
        classCode: row.class_code,
        className: row.class_name,
      },
    });
  };

  return (
    <Grid container spacing={2}>
      {(rows ?? []).length === 0 ? (
        <Grid size={12}>
          <Box className="advisor-class__empty">
            Không có lớp chủ nhiệm
          </Box>
        </Grid>
      ) : (
        (rows ?? []).map((row) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={row.id}>
            <Card className="advisor-class__card">
              <CardActionArea
                onClick={() => handleViewClass(row)}
                className="advisor-class__action"
              >
                <CardContent className="advisor-class__content">
                  <Typography variant="h6" className="advisor-class__title">
                    {row.class_name} ({row.class_code})
                  </Typography>

                  <Typography variant="body2" className="advisor-class__subtitle">
                    Sĩ số: {row.size}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}

export default AdvisorClass;
