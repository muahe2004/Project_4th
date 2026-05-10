import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useGetScoreByClassSubject } from "../apis/getScoreByClassSubject";
import ListStudentScoreTable from "../components/ListStudentScoreTable";
import Button from "../../../components/Button/Button";
import ImportScoreModel from "../components/ImportScoreModel";
import AddScoreComponent from "../components/AddScoreComponent";
import { useUploadScore } from "../apis/uploadScore";
import { useImportScoreList } from "../apis/importScoreList";
import { useAddScoreList } from "../apis/addScoreList";
import { useFillComponentScore } from "../apis/fillCompoentScore";
import { useUpdateScoreStatusBulk } from "../apis/updateScoreStatusBulk";
import { useSnackbar } from "../../../components/SnackBar/SnackBar";
import {
  COMPONENT_TYPE_MIDDLE_ALIASES,
  SCORE_TYPE_OFFICIAL,
} from "../../grades/types";
import type {
  IScoreByClassSubjectResponse,
  IScoreUploadResponse,
  IScoreUploadRow,
} from "../types";

function ListStudentScoreSubjectContent({
  data,
  isLoading,
  isError,
  error,
  editableMidterm,
  editableFinal,
  midtermDrafts,
  finalDrafts,
  onMidtermChange,
  onFinalChange,
}: {
  data?: IScoreByClassSubjectResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  editableMidterm?: boolean;
  editableFinal?: boolean;
  midtermDrafts?: Record<string, string>;
  finalDrafts?: Record<string, string>;
  onMidtermChange?: (scoreId: string, value: string) => void;
  onFinalChange?: (scoreId: string, value: string) => void;
}) {
  return (
    <>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.response?.data?.detail ?? "Lấy danh sách điểm theo lớp/môn thất bại"}
        </Alert>
      ) : (
        <ListStudentScoreTable
          rows={data?.students}
          editableMidterm={editableMidterm}
          editableFinal={editableFinal}
          midtermDrafts={midtermDrafts}
          finalDrafts={finalDrafts}
          onMidtermChange={onMidtermChange}
          onFinalChange={onFinalChange}
        />
      )}
    </>
  );
}

export function ListStudentScoreSubject() {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openImportScoreModel, setOpenImportScoreModel] = useState(false);
  const [openAddScoreComponent, setOpenAddScoreComponent] = useState(false);
  const [openLockConfirm, setOpenLockConfirm] = useState(false);
  const [editableMidterm, setEditableMidterm] = useState(false);
  const [editableFinal, setEditableFinal] = useState(false);
  const [midtermDrafts, setMidtermDrafts] = useState<Record<string, string>>({});
  const [finalDrafts, setFinalDrafts] = useState<Record<string, string>>({});
  const [importPreview, setImportPreview] = useState<IScoreUploadResponse | null>(null);
  const [importScoreError, setImportScoreError] = useState<string | null>(null);
  const [isUploadingScorePreview, setIsUploadingScorePreview] = useState(false);
  const state = location.state as
      | {
        classId?: string;
        subjectId?: string;
        academicTermId?: string;
        classCode?: string;
        className?: string;
        subjectCode?: string;
        subjectName?: string;
      }
    | undefined;

  const classId = state?.classId;
  const subjectId = state?.subjectId;
  const academicTermId = state?.academicTermId ?? "";
  const { showSnackbar } = useSnackbar();
  const scoreQuery = useGetScoreByClassSubject(
    classId && subjectId
      ? {
          class_id: classId,
          subject_id: subjectId,
        }
      : undefined,
    {
      enabled: Boolean(classId && subjectId),
    }
  );
  const canEditMidterm = useMemo(() => {
    const students = scoreQuery.data?.students ?? [];

    return students.some((student) => student.scores.length > 0);
  }, [scoreQuery.data?.students]);
  const canEditFinal = useMemo(() => {
    const students = scoreQuery.data?.students ?? [];

    return students.some((student) => {
      const officialMidScores = student.scores.filter((score) => {
        const scoreType = (score.score_type ?? "").toUpperCase().trim();
        const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
        return scoreType === SCORE_TYPE_OFFICIAL && COMPONENT_TYPE_MIDDLE_ALIASES.includes(componentType);
      });

      const filledMidScores = officialMidScores.filter((score) => score.score !== null);
      return officialMidScores.length >= 2 && filledMidScores.length >= 2;
    });
  }, [classId, subjectId, scoreQuery.data?.students]);
  const canLockScore = useMemo(() => canEditMidterm && canEditFinal, [canEditMidterm, canEditFinal]);
  const isScoreLocked = useMemo(() => {
    const students = scoreQuery.data?.students ?? [];
    if (students.length === 0) {
      return false;
    }

    return students.every((student) => {
      const officialMidScores = student.scores.filter((score) => {
        const scoreType = (score.score_type ?? "").toUpperCase().trim();
        const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
        return scoreType === SCORE_TYPE_OFFICIAL && COMPONENT_TYPE_MIDDLE_ALIASES.includes(componentType);
      });
      const officialFinalScores = student.scores.filter((score) => {
        const scoreType = (score.score_type ?? "").toUpperCase().trim();
        const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
        return scoreType === SCORE_TYPE_OFFICIAL && componentType === "FINAL";
      });

      const hasRequiredScores = officialMidScores.length >= 2 && officialFinalScores.length >= 1;
      const allRequiredScoresActive = [...officialMidScores.slice(0, 2), ...officialFinalScores.slice(0, 1)].every(
        (score) => (score.status ?? "").toLowerCase().trim() === "active"
      );

      return hasRequiredScores && allRequiredScoresActive;
    });
  }, [scoreQuery.data?.students]);
  const existingComponentIds = useMemo(() => {
    const students = scoreQuery.data?.students ?? [];
    const componentIds = new Set<string>();

    students.forEach((student) => {
      student.scores.forEach((score) => {
        const componentType = (score.score_component?.component_type ?? "").toUpperCase().trim();
        if (score.score_component?.id && COMPONENT_TYPE_MIDDLE_ALIASES.includes(componentType)) {
          componentIds.add(score.score_component.id);
        }
      });
    });

    return Array.from(componentIds);
  }, [scoreQuery.data?.students]);
  const existingScoreIdsByStudentAndComponent = useMemo(() => {
    const students = scoreQuery.data?.students ?? [];
    const mapping: Record<string, string> = {};

    students.forEach((student) => {
      student.scores.forEach((score) => {
        const componentId = score.score_component?.id;
        if (!componentId) {
          return;
        }
        mapping[`${student.student_info.id}:${componentId}`] = score.id;
      });
    });

    return mapping;
  }, [scoreQuery.data?.students]);

  const handleComponentClick = () => {
    const students = scoreQuery.data?.students ?? [];

    console.log("component payload", {
      academic_term_id: academicTermId,
      subject_id: subjectId ?? "",
      students: students.map((student) => student.student_info),
    });

    setOpenAddScoreComponent(true);
  };

  const { mutateAsync: uploadScoreFile, isPending: isUploadingScoreFile } = useUploadScore({});
  const { mutateAsync: importScoreList, isPending: isImportingScoreList } = useImportScoreList({});
  const { mutateAsync: addScoreList, isPending: isAddingScoreList } = useAddScoreList({});
  const { mutateAsync: fillComponentScore, isPending: isFillingComponentScore } = useFillComponentScore({});
  const { mutateAsync: updateScoreStatusBulk, isPending: isUpdatingScoreStatusBulk } = useUpdateScoreStatusBulk({});

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleLockScore = async () => {
    const scores = (scoreQuery.data?.students ?? []).flatMap((student) =>
      student.scores
        .filter((score) => (score.status ?? "").toLowerCase().trim() === "pending")
        .map((score) => ({ id: score.id }))
    );

    if (scores.length === 0) {
      showSnackbar("Không có điểm pending để khoá.", "info");
      return;
    }

    try {
      const result = await updateScoreStatusBulk({ scores });
      console.log("lock scores payload", { scores });
      console.log("lock scores result", result);
      showSnackbar("Khoá điểm thành công.", "success");
      await scoreQuery.refetch();
    } catch (error) {
      console.error("lock scores error", error);
      showSnackbar("Khoá điểm thất bại.", "error");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingScorePreview(true);

    try {
      const uploadedResult = await uploadScoreFile(file);
      setImportPreview(uploadedResult);
      setOpenImportScoreModel(true);
    } catch (uploadError) {
      console.error("Upload score file failed:", uploadError);
      setImportScoreError((uploadError as any)?.response?.data?.detail ?? "Upload score file failed");
      setOpenImportScoreModel(false);
    } finally {
      setIsUploadingScorePreview(false);
      event.target.value = "";
    }
  };

  const handleSaveMidterm = async () => {
    const students = scoreQuery.data?.students ?? [];
    const payload = {
      scores: students.flatMap((student) => {
        const officialMidScores = student.scores
          .filter((score) => {
            const scoreType = (score.score_type ?? "").toUpperCase().trim();
            const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
            return scoreType === SCORE_TYPE_OFFICIAL && COMPONENT_TYPE_MIDDLE_ALIASES.includes(componentType);
          })
          .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
          .slice(0, 2);

        return officialMidScores.flatMap((score) => {
          const draftValue = midtermDrafts[score.id];
          if (draftValue === undefined || draftValue === "") {
            return [];
          }

          const parsedScore = Number(draftValue);
          if (Number.isNaN(parsedScore)) {
            return [];
          }

          return [
            {
              id: score.id,
              score: parsedScore,
              score_type: "Official",
              status: "pending",
            },
          ];
        });
      }),
    };

    if (payload.scores.length === 0) {
      console.log("midterm drafts", {
        academic_term_id: academicTermId,
        subject_id: subjectId ?? "",
        class_id: classId ?? "",
        students: students.map((student) => student.student_info),
        drafts: midtermDrafts,
      });
      showSnackbar("Chưa có điểm nào để lưu.", "info");
      return;
    }

    try {
      const result = await fillComponentScore(payload);
      console.log("save midterm result", result);
      showSnackbar("Lưu điểm thành phần thành công.", "success");
      setEditableMidterm(false);
      setMidtermDrafts({});
    } catch (error) {
      console.error("save midterm error", error);
      showSnackbar("Lưu điểm thành phần thất bại.", "error");
    }
  };

  const handleSaveFinal = async () => {
    const students = scoreQuery.data?.students ?? [];
    const updatePayload = {
      scores: students.flatMap((student) => {
        const officialFinalScores = student.scores
          .filter((score) => {
            const scoreType = (score.score_type ?? "").toUpperCase().trim();
            const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
            return scoreType === SCORE_TYPE_OFFICIAL && componentType === "FINAL";
          })
          .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
          .slice(0, 1);

        const existingFinalScore = officialFinalScores[0];
        if (!existingFinalScore) {
          return [];
        }

        const draftKey = `${student.student_info.id}:final`;
        const draftValue = finalDrafts[draftKey] ?? finalDrafts[existingFinalScore.id];
        if (draftValue === undefined || draftValue === "") {
          return [];
        }

        const parsedScore = Number(draftValue);
        if (Number.isNaN(parsedScore)) {
          return [];
        }

        return [
          {
            id: existingFinalScore.id,
            score: parsedScore,
            score_type: "Official",
            status: "pending",
          },
        ];
      }),
    };
    const createPayload = {
      scores: students.flatMap((student) => {
        const officialFinalScores = student.scores
          .filter((score) => {
            const scoreType = (score.score_type ?? "").toUpperCase().trim();
            const componentType = (score.score_component.component_type ?? "").toUpperCase().trim();
            return scoreType === SCORE_TYPE_OFFICIAL && componentType === "FINAL";
          })
          .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
          .slice(0, 1);

        if (officialFinalScores.length > 0) {
          return [];
        }

        const draftKey = `${student.student_info.id}:final`;
        const draftValue = finalDrafts[draftKey];
        if (draftValue === undefined || draftValue === "") {
          return [];
        }

        const parsedScore = Number(draftValue);
        if (Number.isNaN(parsedScore)) {
          return [];
        }

        return [
          {
            student_id: student.student_info.id,
            subject_id: subjectId ?? "",
            academic_term_id: academicTermId ?? "",
            component_type: "FINAL",
            score: parsedScore,
            attempt: 1,
            score_type: "Official",
            status: "pending",
          },
        ];
      }),
    };

    if (updatePayload.scores.length === 0 && createPayload.scores.length === 0) {
      console.log("final drafts", {
        academic_term_id: academicTermId,
        subject_id: subjectId ?? "",
        class_id: classId ?? "",
        students: students.map((student) => student.student_info),
        drafts: finalDrafts,
      });
      showSnackbar("Chưa có điểm thi nào để lưu.", "info");
      return;
    }

    try {
      console.log("save final update payload", updatePayload);
      console.log("save final create payload", createPayload);
      if (updatePayload.scores.length > 0) {
        const updateResult = await fillComponentScore(updatePayload);
        console.log("save final update result", updateResult);
      }

      if (createPayload.scores.length > 0) {
        const createResult = await addScoreList(createPayload);
        console.log("save final create result", createResult);
      }

      showSnackbar("Lưu điểm thi thành công.", "success");
      setEditableFinal(false);
      setFinalDrafts({});
    } catch (error) {
      console.error("save final error", error);
      showSnackbar("Lưu điểm thi thất bại.", "error");
    }
  };

  return (
    <main className="admin-main-container">
      <Box
        className="admin-main-box"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography className="primary-title" sx={{ mb: 0 }}>
          Lớp: {state?.className ?? "-"} ({state?.classCode ?? "-"}) - Môn: {state?.subjectName ?? "-"} ({state?.subjectCode ?? "-"})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button onClick={handleImportClick} className="btn-spacing-left" disabled={isUploadingScoreFile || isScoreLocked}>
            {isUploadingScoreFile ? "Uploading..." : "Import"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={(event) => void handleFileChange(event)}
          />

          {canLockScore && !isScoreLocked && (
            <Button onClick={() => setOpenLockConfirm(true)} className="" disabled={isUpdatingScoreStatusBulk}>
              {isUpdatingScoreStatusBulk ? "Đang khoá..." : "Khoá điểm"}
            </Button>
          )}

          <Button onClick={handleComponentClick} className="" disabled={!classId || !subjectId || scoreQuery.isLoading || isScoreLocked}>
            Thành phần
          </Button>

          <Button
            onClick={() => {
              setEditableMidterm((prev) => !prev);
              if (editableMidterm) {
                setMidtermDrafts({});
              }
            }}
            className=""
            disabled={!canEditMidterm || isScoreLocked}
          >
            {editableMidterm ? "Dừng nhập TP" : "Nhập điểm TP"}
          </Button>

          <Button
            onClick={() => {
              setEditableFinal((prev) => !prev);
            }}
            className=""
            disabled={!canEditFinal || isScoreLocked}
          >
            {editableFinal ? "Dừng nhập Thi" : "Nhập điểm Thi"}
          </Button>

          {(editableMidterm || editableFinal) && (
            <Button
              onClick={() => {
                if (editableMidterm) {
                  void handleSaveMidterm();
                }
                if (editableFinal) {
                  void handleSaveFinal();
                }
              }}
              className=""
              disabled={isFillingComponentScore}
            >
              {isFillingComponentScore ? "Đang lưu..." : "Lưu lại"}
            </Button>
          )}
        </Box>
      </Box>

      {!classId || !subjectId ? (
        <Alert severity="warning">Thiếu classId hoặc subjectId để tải dữ liệu.</Alert>
      ) : (
        <ListStudentScoreSubjectContent
          {...scoreQuery}
          data={scoreQuery.data}
          isLoading={scoreQuery.isLoading}
          isError={scoreQuery.isError}
          error={scoreQuery.error}
          editableMidterm={editableMidterm}
          editableFinal={editableFinal}
          midtermDrafts={midtermDrafts}
          finalDrafts={finalDrafts}
          onMidtermChange={(scoreId, value) => {
            setMidtermDrafts((prev) => ({
              ...prev,
              [scoreId]: value,
            }));
          }}
              onFinalChange={(scoreId, value) => {
                setFinalDrafts((prev) => ({
                  ...prev,
                  [scoreId]: value,
                }));
              }}
        />
      )}

      <ImportScoreModel
        open={openImportScoreModel}
        onClose={() => {
          setOpenImportScoreModel(false);
          setImportPreview(null);
          setImportScoreError(null);
          setIsUploadingScorePreview(false);
        }}
        data={importPreview}
        isImporting={isUploadingScorePreview || isImportingScoreList}
        errorMessage={importScoreError}
        onImport={async (scoresPayload: IScoreUploadRow[]) => {
          const cleanScoresPayload = scoresPayload.map(({ row, ...score }) => score);
          const academicTermId = importPreview?.file_information.academic_term_id;
          const subjectId = importPreview?.file_information.subject_id;
          if (!academicTermId || !subjectId) {
            setImportScoreError("Thiếu academic_term_id hoặc subject_id từ file upload.");
            return;
          }
          const importPayload = {
            academic_term_id: academicTermId,
            subject_id: subjectId,
            class_code: importPreview?.file_information.class_code,
            attempt: importPreview?.file_information.attempt,
            scores: cleanScoresPayload.map((score) => ({
              score_1: score.d1 ?? null,
              score_2: score.d2 ?? null,
              score_exam: score.thi ?? null,
              student_id: score.student_id ?? null,
              student_code: score.student_code ?? null,
              class_code: score.class_code ?? null,
            })),
          };
          try {
            const result = await importScoreList(importPayload as any);
            await scoreQuery.refetch();
            setOpenImportScoreModel(false);
            setImportPreview(null);
            setImportScoreError(null);
          } catch (error) {
            setImportScoreError((error as any)?.response?.data?.detail ?? "Import score list failed");
          }
        }}
      />

      <Dialog
        open={openLockConfirm}
        onClose={() => setOpenLockConfirm(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Xác nhận khoá điểm</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn khoá tất cả các điểm đang ở trạng thái pending không?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenLockConfirm(false)}
            className="button-cancel"
          >
            Huỷ
          </Button>
          <Button
            onClick={async () => {
              setOpenLockConfirm(false);
              await handleLockScore();
            }}
            disabled={isUpdatingScoreStatusBulk}
          >
            {isUpdatingScoreStatusBulk ? "Đang khoá..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      <AddScoreComponent
        open={openAddScoreComponent}
        onClose={() => setOpenAddScoreComponent(false)}
        academicTermId={academicTermId}
        subjectId={subjectId}
        students={scoreQuery.data?.students?.map((student) => student.student_info) ?? []}
        existingComponentIds={existingComponentIds}
        existingScoreIdsByStudentAndComponent={existingScoreIdsByStudentAndComponent}
      />
    </main>
  );
}

export default ListStudentScoreSubject;
