import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import Button from "../../../components/Button/Button";
import CheckBox from "../../../components/Checkbox/CheckBox";
import { useGetScoreComponents } from "../apis/getScoreComponents";
import type { IScoreComponent } from "../apis/getScoreComponents";
import { useAddScoreList } from "../apis/addScoreList";
import { useFillComponentScore } from "../apis/fillCompoentScore";
import { COMPONENT_TYPE_MIDDLE_ALIASES } from "../../grades/types";

import "./styles/AddScoreComponent.css";

interface AddScoreComponentProps {
  open: boolean;
  onClose: () => void;
  subjectId?: string;
  academicTermId?: string;
  existingComponentIds?: string[];
  existingScoreIdsByStudentAndComponent?: Record<string, string>;
  students?: Array<{
    id: string;
    student_code: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  }>;
}

export function AddScoreComponent({
  open,
  onClose,
  subjectId,
  academicTermId,
  existingComponentIds = [],
  existingScoreIdsByStudentAndComponent = {},
  students = [],
}: AddScoreComponentProps) {
  const [search, setSearch] = useState("");
  const { data: scoreComponents = [] } = useGetScoreComponents({ enabled: open });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
  const { mutateAsync: addScoreList, isPending: isAddingScoreList } = useAddScoreList({});
  const { mutateAsync: fillComponentScore, isPending: isFillingComponentScore } = useFillComponentScore({});

  const filteredComponents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return scoreComponents
      .filter((component) =>
        COMPONENT_TYPE_MIDDLE_ALIASES.includes((component.component_type ?? "").toUpperCase().trim())
      )
      .filter((component) => {
        if (!keyword) {
          return true;
        }
        return `${component.description ?? ""} ${component.component_type}`.toLowerCase().includes(keyword);
      });
  }, [scoreComponents, search]);

  const canSelectMore = selectedIds.length < 2;

  useEffect(() => {
    if (!open) {
      return;
    }
    const nextSelected = existingComponentIds.slice(0, 2);
    setSelectedIds(nextSelected);
    setInitialSelectedIds(nextSelected);
  }, [existingComponentIds, open]);

  const handleToggle = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length >= 2) {
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const removedComponentIds = initialSelectedIds.filter((id) => !selectedIds.includes(id));
    const addedComponentIds = selectedIds.filter((id) => !initialSelectedIds.includes(id));
    const updatePairs = removedComponentIds.map((removedComponentId, index) => ({
      fromComponentId: removedComponentId,
      toComponentId: addedComponentIds[index] ?? null,
    }));

    const updatePayload = {
      scores: students.flatMap((student) =>
        updatePairs.flatMap(({ fromComponentId, toComponentId }) => {
          if (!toComponentId) {
            return [];
          }

          const scoreId = existingScoreIdsByStudentAndComponent[`${student.id}:${fromComponentId}`];
          if (!scoreId) {
            return [];
          }

          return [
            {
              id: scoreId,
              score_component_id: toComponentId,
              score_type: "Official",
              status: "pending",
            },
          ];
        })
      ),
    };
    const createPayload = {
      scores: students.flatMap((student) =>
        addedComponentIds.slice(updatePairs.length).flatMap((componentId) => {
          const component = scoreComponents.find((item) => item.id === componentId);
          if (!component) {
            return [];
          }

          return [
            {
              student_id: student.id,
              subject_id: subjectId ?? "",
              component_type: component.component_type,
              score_component_id: component.id,
              academic_term_id: academicTermId ?? "",
              score: null,
              attempt: 1,
              score_type: "Official",
              status: "pending",
            },
          ];
        })
      ),
    };

    const run = async () => {
      if (updatePayload.scores.length > 0) {
        await fillComponentScore(updatePayload);
      }

      if (createPayload.scores.length > 0) {
        await addScoreList(createPayload);
      }

      onClose();
      setSearch("");
      setSelectedIds([]);
      setInitialSelectedIds([]);
    };

    void run();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="add-score-component__dialog">
      <DialogTitle className="add-score-component__title">Thành phần điểm</DialogTitle>
      <DialogContent className="add-score-component__content">
        <Box className="add-score-component__search">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm thành phần..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="add-score-component__input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className="add-score-component__list">
          {filteredComponents.length === 0 ? (
            <Typography className="add-score-component__empty">Không có dữ liệu</Typography>
          ) : (
            filteredComponents.map((component) => {
              const isSelected = selectedIds.includes(component.id);
              const isDisabled = !isSelected && !canSelectMore;

              return (
                <Box key={component.id} className="add-score-component__item">
                  <CheckBox
                    checked={isSelected}
                    onChange={() => handleToggle(component.id)}
                    disabled={isDisabled}
                  />
                  <Box className="add-score-component__item-body" sx={{ flex: 1 }}>
                    <Typography className="add-score-component__item-name">
                      {component.description || component.component_type}
                    </Typography>
                    <Typography className="add-score-component__item-desc">
                      {component.description ? `(${component.component_type})` : "Không có mô tả"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </DialogContent>

      <DialogActions className="primary-dialog-actions">
        <Button
          onClick={() => {
            setSearch("");
            setSelectedIds([]);
            setInitialSelectedIds([]);
            onClose();
          }}
          className="button-cancel"
        >
          Huỷ
        </Button>
        <Button
          onClick={() => {
            handleSave();
          }}
          disabled={isAddingScoreList || isFillingComponentScore || selectedIds.length === 0}
        >
          {isAddingScoreList || isFillingComponentScore ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddScoreComponent;
