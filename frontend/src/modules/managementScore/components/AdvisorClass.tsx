import { useNavigate } from "react-router-dom";
import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useTranslation } from "react-i18next";

import type { IAdvisorClassItem } from "../apis/getAdvisorClass";
import { advisorClassScoreUrl } from "../../../routes/urls";

import "./styles/AdvisorClass.css";

interface AdvisorClassProps {
  rows?: IAdvisorClassItem[];
  onViewClass?: (row: IAdvisorClassItem) => void;
}

export function AdvisorClass({ rows, onViewClass }: AdvisorClassProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewClass = (row: IAdvisorClassItem) => {
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
    <Box className="advisor-class__grid">
      {(rows ?? []).length === 0 ? (
        <Box className="advisor-class__empty">
          {t("teacherManagementScore.advisor.empty")}
        </Box>
      ) : (
        (rows ?? []).map((row) => (
          <Card key={row.id} className="advisor-class__card">
            <CardActionArea onClick={() => handleViewClass(row)} className="advisor-class__action">
              <CardContent className="advisor-class__content">
                <Typography variant="caption" className="advisor-class__label">
                  {t("teacherManagementScore.advisor.label")}
                </Typography>

                <Typography variant="h6" className="advisor-class__title">
                  {row.class_name} ({row.class_code})
                </Typography>

                <Typography variant="body2" className="advisor-class__desc">
                  {t("teacherManagementScore.advisor.size", { size: row.size })}
                </Typography>

                <Box className="advisor-class__footer">
                  <Box className="advisor-class__footer-left">
                    <VisibilityOutlinedIcon className="advisor-class__footer-icon" fontSize="small" />
                    <Typography variant="body2" className="advisor-class__footer-text">
                      {t("teacherManagementScore.advisor.view")}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))
      )}
    </Box>
  );
}

export default AdvisorClass;
