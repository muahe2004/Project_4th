import { useEffect, useMemo, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { ITrainingProgramFileSubjectData } from "../types";
import Button from "../../../components/Button/Button";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { useSubjectDropDown } from "../../teachingSchedule/apis/getSubjectDropDown";
import { useSubjectDropDownByIds } from "../../teachingSchedule/apis/getSubjectDropDownByIds";
import type { ISubjectDropDown } from "../../teachingSchedule/types";

interface ImportFormModelDialogProps {
  open: boolean;
  onClose: () => void;
  initialSubject: ITrainingProgramFileSubjectData | null;
  onSave: (subject: ITrainingProgramFileSubjectData) => void;
}

const ImportFormModelDialog = ({
  open,
  onClose,
  initialSubject,
  onSave,
}: ImportFormModelDialogProps) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<ITrainingProgramFileSubjectData>({
    subject_id: null,
    subject_code: null,
    subject_name: null,
    term: null,
  });
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultSubject: ITrainingProgramFileSubjectData = {
      subject_id: null,
      subject_code: null,
      subject_name: null,
      term: null,
    };

    setSubject(initialSubject ?? defaultSubject);
    setSubjectSearch("");
    setSelectedSubjectId(initialSubject?.subject_id || "");
  }, [open, initialSubject]);

  const { data: subjects = [] } = useSubjectDropDown({
    limit: 10,
    skip: 0,
    search: subjectSearch || undefined,
  });
  const { data: selectedSubjects = [] } = useSubjectDropDownByIds(
    selectedSubjectId ? { ids: [selectedSubjectId] } : { ids: [] }
  );

  const subjectOptions = useMemo(
    () => Array.from(new Map([...selectedSubjects, ...subjects].map((item) => [item.id, item])).values()),
    [selectedSubjects, subjects]
  );

  useEffect(() => {
    if (!open || selectedSubjectId || !initialSubject) {
      return;
    }

    const matchedSubject = subjectOptions.find((item) => {
      if (initialSubject.subject_id && item.id === initialSubject.subject_id) {
        return true;
      }
      const codeMatches =
        initialSubject.subject_code != null && item.subject_code === initialSubject.subject_code;
      const nameMatches =
        initialSubject.subject_name != null && item.name === initialSubject.subject_name;
      return codeMatches || nameMatches;
    });

    if (matchedSubject?.id) {
      setSelectedSubjectId(matchedSubject.id);
      setSubject((prev) => ({
        ...prev,
        subject_id: matchedSubject.id,
        subject_code: matchedSubject.subject_code,
        subject_name: matchedSubject.name,
      }));
    }
  }, [open, initialSubject, selectedSubjectId, subjectOptions]);

  const setField = (field: keyof ITrainingProgramFileSubjectData, value: string) => {
    const nextValue = field === "term"
      ? (value ? Number(value) : null)
      : (value || null);

    setSubject((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="primary-dialog-title">{t("trainingProgram.import.editTitle")}</DialogTitle>
      <DialogContent dividers>
        <Box className="myprofile-form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div>
            <LabelPrimary value={t("trainingProgram.form.subject")} required />
            <MainAutocomplete
              options={subjectOptions}
              value={selectedSubjectId || null}
              onChange={(id) => {
                setSelectedSubjectId(id);
                const selected = subjectOptions.find((item) => item.id === id) ?? null;
                setSubject({
                  subject_id: selected?.id ?? null,
                  subject_code: selected?.subject_code ?? null,
                  subject_name: selected?.name ?? null,
                  term: subject.term,
                });
              }}
              onSearchChange={setSubjectSearch}
              getOptionLabel={(option: ISubjectDropDown) =>
                option.subject_code ? `${option.subject_code} - ${option.name}` : option.name
              }
              getOptionId={(option: ISubjectDropDown) => option.id}
              placeholder={t("trainingProgram.form.selectSubject")}
            />
          </div>
          <div>
            <LabelPrimary value={t("trainingProgram.form.term")} required />
            <TextField
              type="number"
              inputProps={{ min: 1 }}
              value={subject.term ?? ""}
              onChange={(event) => setField("term", event.target.value)}
              fullWidth
              variant="outlined"
              className="main-text__field"
            />
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="button-cancel">{t("common.cancel")}</Button>
        <Button
          onClick={() => onSave(subject)}
          disabled={!subject.subject_code || !subject.subject_name || !subject.term}
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFormModelDialog;
