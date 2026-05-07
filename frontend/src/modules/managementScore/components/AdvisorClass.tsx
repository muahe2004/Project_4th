import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";

import type { IAdvisorClassItem } from "../apis/getAdvisorClass";

import "./styles/AdvisorClass.css";

interface AdvisorClassProps {
  rows?: IAdvisorClassItem[];
  onViewClass?: (row: IAdvisorClassItem) => void;
}

export function AdvisorClass({ rows, onViewClass }: AdvisorClassProps) {
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
                onClick={() => onViewClass?.(row)}
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
