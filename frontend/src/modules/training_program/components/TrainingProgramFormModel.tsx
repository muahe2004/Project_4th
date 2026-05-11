import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  Typography,
} from "@mui/material";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import LabelPrimary from "../../../components/Label/Label";
import MainAutocomplete from "../../../components/Autocomplete/MainAutocomplete";
import { STATUS } from "../../../constants/status";
import { useConfirmCloseForm } from "../../../hooks/useConfirm";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import { useSpecializationsDropDown } from "../../specializations/apis/getSpecializationDropDown";
import { useSpecializationsDropDownByIds } from "../../specializations/apis/getSpecializationDropDownByIds";
import { useAddTrainingProgram } from "../apis/addTrainingProgram";
import { useUpdateTrainingProgram } from "../apis/updateTrainingProgram";
import ImportFormModelDialog from "./ImportFormModelDialog";
import type {
  ITrainingProgram,
  ITrainingProgramCreate,
  ITrainingProgramCreateWithSubjects,
  ITrainingProgramFileSubjectData,
  ITrainingProgramUpdate,
} from "../types";

const TRAINING_PROGRAM_TYPE_OPTIONS = [
  { value: "Dai hoc chinh quy", label: "Đại học chính quy" },
  { value: "Lien thong", label: "Liên thông" },
  { value: "Van bang 2", label: "Văn bằng 2" },
];

const getAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => {
    const startYear = currentYear + index;
    return {
      value: `${startYear} - ${startYear + 1}`,
      label: `${startYear} - ${startYear + 1}`,
    };
  });
};

const ACADEMIC_YEAR_OPTIONS = getAcademicYearOptions();

interface TrainingProgramFormModelProps {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: ITrainingProgram;
  onClose: () => void;
}

const TrainingProgramFormModel = ({
  open,
  mode,
  initialValues,
  onClose,
}: TrainingProgramFormModelProps) => {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const id = initialValues?.id;

  const [programType, setProgramType] = useState("");
  const [trainingProgramName, setTrainingProgramName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [searchSpecialization, setSearchSpecialization] = useState("");
  const [openConfirmSave, setOpenConfirmSave] = useState(false);
  const [subjects, setSubjects] = useState<ITrainingProgramFileSubjectData[]>([]);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number>(-1);
  const [editingSubject, setEditingSubject] = useState<ITrainingProgramFileSubjectData | null>(null);

  const params = {
    limit: 20,
    skip: 0,
    search: searchSpecialization || undefined,
  };

  const { data: specializations = [] } = useSpecializationsDropDown(params);
  const { data: selectedSpecializations = [] } = useSpecializationsDropDownByIds(
    specializationId ? { ids: [specializationId] } : { ids: [] }
  );
  const { mutateAsync: addTrainingProgram } = useAddTrainingProgram();
  const { mutateAsync: updateTrainingProgram } = useUpdateTrainingProgram();

  const autocompleteOptions = useMemo(() => {
    const merged = [...selectedSpecializations, ...specializations];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }, [selectedSpecializations, specializations]);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setProgramType(initialValues.program_type || "");
      setTrainingProgramName(initialValues.training_program_name || "");
      setAcademicYear(initialValues.academic_year || "");
      setSpecializationId(initialValues.specialization_id || "");
      setSubjects(
        (initialValues.subjects ?? []).map((subject) => ({
          subject_id: subject.subject_id,
          subject_code: subject.subject_code,
          subject_name: subject.subject_name,
          term: subject.term,
        }))
      );
      return;
    }

    setProgramType("");
    setTrainingProgramName("");
    setAcademicYear("");
    setSpecializationId("");
    setSubjects([]);
  }, [mode, initialValues, open]);

  const currentValues: ITrainingProgramCreate = {
    program_type: programType.trim(),
    training_program_name: trainingProgramName.trim() || null,
    academic_year: academicYear.trim(),
    status: STATUS.ACTIVE,
    specialization_id: specializationId,
  };

  const { openConfirm, setOpenConfirm, handleCloseClick } = useConfirmCloseForm({
    mode,
    initialValues,
    currentValues,
    onClose,
  });

  const handleSubmitClick = () => {
    if (mode === "edit") {
      setOpenConfirmSave(true);
      return;
    }

    void handleConfirmSave();
  };

  const handleConfirmSave = async () => {
    try {
      if (mode === "add") {
        const createSubjects = subjects
          .filter((subject): subject is ITrainingProgramFileSubjectData & { subject_id: string } =>
            Boolean(subject.subject_id)
          )
          .map((subject) => ({
            subject_id: subject.subject_id,
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            term: subject.term,
          }));

        const payload: ITrainingProgramCreateWithSubjects = {
          ...currentValues,
          subjects: createSubjects,
        };

        await addTrainingProgram(payload);
        showSnackbar(t("trainingProgram.messages.addSuccess"), "success");
      } else if (mode === "edit" && id) {
        const payload: ITrainingProgramUpdate = {
          ...currentValues,
          subjects: subjects.map((subject) => {
            if (!subject.subject_id) {
              throw new Error(t("trainingProgram.messages.missingSubjectId"));
            }

            return {
              subject_id: subject.subject_id,
              term: subject.term,
            };
          }),
        };

        await updateTrainingProgram({ id, data: payload });
        showSnackbar(t("trainingProgram.messages.updateSuccess"), "success");
      }

      setOpenConfirmSave(false);
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar(t("trainingProgram.messages.genericError"), "error");
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseClick} className="primary-dialog department-form" maxWidth="sm" fullWidth>
      <DialogTitle className="primary-dialog-title">
        {mode === "add" ? t("trainingProgram.form.titleAdd") : t("trainingProgram.form.titleEdit")}
      </DialogTitle>
      <DialogContent className="primary-dialog-content">
        <LabelPrimary value={t("trainingProgram.form.programType")} required />
        <Select
          value={programType}
          onChange={(e) => setProgramType(String(e.target.value))}
          fullWidth
          displayEmpty
          className="main-text__field primary-dialog-input"
          renderValue={(value) => {
            const selected = TRAINING_PROGRAM_TYPE_OPTIONS.find((option) => option.value === value);
            return selected?.label || t("trainingProgram.form.selectProgramType");
          }}
        >
          {TRAINING_PROGRAM_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <LabelPrimary value={t("trainingProgram.form.programName")} />
        <TextField
          value={trainingProgramName}
          onChange={(e) => setTrainingProgramName(e.target.value)}
          fullWidth
          variant="outlined"
          className="main-text__field primary-dialog-input"
        />

        <LabelPrimary value={t("trainingProgram.form.academicYear")} required />
        <Select
          value={academicYear}
          onChange={(e) => setAcademicYear(String(e.target.value))}
          fullWidth
          displayEmpty
          className="main-text__field primary-dialog-input"
          renderValue={(value) => {
            const selected = ACADEMIC_YEAR_OPTIONS.find((option) => option.value === value);
            return selected?.label || t("trainingProgram.form.selectAcademicYear");
          }}
        >
          {ACADEMIC_YEAR_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <LabelPrimary value={t("trainingProgram.form.specialization")} required />
        <MainAutocomplete
          options={autocompleteOptions}
          value={specializationId}
          onChange={setSpecializationId}
          onSearchChange={setSearchSpecialization}
          getOptionLabel={(option) => option.name}
          getOptionId={(option) => option.id}
          placeholder={t("trainingProgram.form.selectSpecialization")}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <LabelPrimary value={t("trainingProgram.form.subjects")} required />
          <Button onClick={() => {
            setEditingSubjectIndex(-1);
            setEditingSubject({ subject_code: null, subject_name: null, term: null });
            setOpenSubjectDialog(true);
          }} className="btn-spacing-left">
            {t("trainingProgram.form.addSubject")}
          </Button>
        </div>

        <TableContainer className="sticky-table-container" component={Paper} sx={{ maxHeight: 360, mt: 1 }}>
          <Table stickyHeader className="sticky-table" aria-label="training program subjects table">
            <TableHead className="primary-thead">
              <TableRow className="primary-trow">
                <TableCell className="primary-thead__cell" align="center">{t("trainingProgram.form.table.subjectCode")}</TableCell>
                <TableCell className="primary-thead__cell" align="left">{t("trainingProgram.form.table.subjectName")}</TableCell>
                <TableCell className="primary-thead__cell" align="center">{t("trainingProgram.form.table.term")}</TableCell>
                <TableCell className="primary-thead__cell" align="center">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject, index) => (
                <TableRow key={`${subject.subject_code || "subject"}-${index}`} className="sticky-trow">
                  <TableCell className="sticky-tcell" align="center">{subject.subject_code || ""}</TableCell>
                  <TableCell className="sticky-tcell" align="left">{subject.subject_name || ""}</TableCell>
                  <TableCell className="sticky-tcell" align="center">{subject.term ?? ""}</TableCell>
                  <TableCell className="sticky-tcell" align="center">
                    <IconButton
                      className="primary-tcell__button--icon"
                      onClick={() => {
                        setEditingSubjectIndex(index);
                        setEditingSubject(subject);
                        setOpenSubjectDialog(true);
                      }}
                    >
                      <EditSquareIcon />
                    </IconButton>
                    <IconButton
                      className="primary-tcell__button--icon primary-tcell__button--delete"
                      onClick={() => setSubjects((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {subjects.length === 0 && (
                <TableRow className="sticky-trow">
                  <TableCell className="sticky-tcell" colSpan={4} align="center">
                    <Typography sx={{ py: 1, color: "#64748b" }}>{t("trainingProgram.form.noSubjects")}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions className="primary-dialog-actions">
        <Button onClick={handleCloseClick} className="button-cancel">{t("common.cancel")}</Button>
        <Button onClick={handleSubmitClick} variant="contained">
          {mode === "add" ? t("common.add") : t("common.save")}
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={openConfirm}
        title={t("common.confirmExitTitle")}
        message={t("trainingProgram.form.confirmExit")}
        onConfirm={() => {
          setOpenConfirm(false);
          onClose();
        }}
        onCancel={() => setOpenConfirm(false)}
      />

      {mode === "edit" && (
        <ConfirmDialog
          open={openConfirmSave}
          title={t("trainingProgram.form.confirmSaveTitle")}
          message={t("trainingProgram.form.confirmSave")}
          onConfirm={handleConfirmSave}
          onCancel={() => setOpenConfirmSave(false)}
        />
      )}

      <ImportFormModelDialog
        open={openSubjectDialog}
        onClose={() => setOpenSubjectDialog(false)}
        initialSubject={editingSubject}
        onSave={(subject) => {
          if (editingSubjectIndex >= 0) {
            setSubjects((prev) => prev.map((item, index) => (index === editingSubjectIndex ? subject : item)));
          } else {
            setSubjects((prev) => [...prev, subject]);
          }
          setOpenSubjectDialog(false);
          setEditingSubject(null);
          setEditingSubjectIndex(-1);
        }}
      />
    </Dialog>
  );
};

export default TrainingProgramFormModel;
