import { useTranslation } from "react-i18next";
import admissionThumb from "../../../assets/images/utehy2.jpg";
import ButtonConfig from "../../../components/Button/Button";
import "./styles/Admission.css";

export function Admission() {
  const { t } = useTranslation();

  return (
    <section className="admission-page">
      <img src={admissionThumb} alt={t("admission.heroAlt")} className="admission-hero" />
      <h1 className="admission-title">{t("admission.title")}</h1>
      <p className="admission-paragraph">{t("admission.intro")}</p>

      <h2 className="admission-subtitle">{t("admission.experienceTitle")}</h2>
      <p className="admission-paragraph">{t("admission.paragraph1")}</p>
      <p className="admission-paragraph">{t("admission.paragraph2")}</p>
      <p className="admission-paragraph">{t("admission.paragraph3")}</p>
      <p className="admission-paragraph">{t("admission.paragraph4")}</p>
      <p className="admission-paragraph">{t("admission.paragraph5")}</p>

      <h3 className="admission-form-title">{t("admission.formTitle")}</h3>
      <p className="admission-form-description">{t("admission.formDescription")}</p>
      <div className="admission-form-layout">
        <div>
          <img src={admissionThumb} alt={t("admission.campusAlt")} className="admission-form-image" />
        </div>
        <form className="admission-form">
          <input
            type="text"
            name="fullName"
            placeholder={t("admission.placeholders.fullName")}
            className="admission-input"
          />
          <input
            type="email"
            name="email"
            placeholder={t("admission.placeholders.email")}
            className="admission-input"
          />
          <input
            type="tel"
            name="phone"
            placeholder={t("admission.placeholders.phone")}
            className="admission-input"
          />
          <ButtonConfig type="button" label={t("admission.submit")} className="admission-submit" />
        </form>
      </div>
      <p className="admission-visit">{t("admission.visitCampus")}</p>

      <p className="admission-closing">{t("admission.closing")}</p>
      <p>
        {t("admission.signature")}
        <br />
        {t("admission.office")}
      </p>
    </section>
  );
}
