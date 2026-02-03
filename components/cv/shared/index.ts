// CV Shared Components - Composants réutilisables par tous les templates
// Chaque template ne devrait définir que le LAYOUT, pas le rendu des sections

export { default as ProfilePicture } from "./ProfilePicture";
export type { ProfilePictureProps } from "./ProfilePicture";

export { default as ContactInfo } from "./ContactInfo";
export type { ContactInfoProps } from "./ContactInfo";

export { default as ExperienceItem } from "./ExperienceItem";
export type { ExperienceItemProps } from "./ExperienceItem";

export { default as EducationItem } from "./EducationItem";
export type { EducationItemProps } from "./EducationItem";

export { default as SkillsGrid } from "./SkillsGrid";
export type { SkillsGridProps } from "./SkillsGrid";

export { default as LanguageList } from "./LanguageList";
export type { LanguageListProps } from "./LanguageList";

export { default as CertificationList } from "./CertificationList";
export type { CertificationListProps } from "./CertificationList";

export { default as ClientReferences } from "./ClientReferences";
export type { ClientReferencesProps } from "./ClientReferences";

export { default as SectionTitle } from "./SectionTitle";
export type { SectionTitleProps } from "./SectionTitle";

export { default as SummaryBlock } from "./SummaryBlock";
export type { SummaryBlockProps } from "./SummaryBlock";

export { default as ProjectItem } from "./ProjectItem";
export type { ProjectItemProps } from "./ProjectItem";

export { default as PageContainer } from "./PageContainer";
export type { PageContainerProps } from "./PageContainer";

export { default as QRCode } from "./QRCode";
export type { QRCodeProps } from "./QRCode";

// Layout components
export { default as SectionGrid, PageSection } from "./SectionGrid";
export type { SectionGridProps, PageSectionProps } from "./SectionGrid";

export { default as PageLayout } from "./PageLayout";
export type { PageLayoutProps } from "./PageLayout";
