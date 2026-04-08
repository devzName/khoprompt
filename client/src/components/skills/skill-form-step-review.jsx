/**
 * Step 4 of skill form wizard: Read-only review of all inputs before submit.
 */
import { Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const ReviewSection = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">
      {label}
    </Text>
    <div className="text-sm text-gray-800 dark:text-neutral-200">{children}</div>
  </div>
);

const ListPreview = ({ items }) => {
  if (!items?.length) return <Text className="text-gray-400 italic text-sm">—</Text>;
  return (
    <ol className="list-decimal list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 dark:text-neutral-300">{item || '—'}</li>
      ))}
    </ol>
  );
};

/**
 * @param {{ values: object, steps: string[], tools: string[], constraints: string[] }} props
 */
const SkillFormStepReview = ({ values, steps, tools, constraints }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 rounded-md border border-gray-200 dark:border-white/10 p-5 bg-gray-50 dark:bg-white/[0.03]">
      <Title level={5} className="!mb-0">{t('skills.form.reviewTitle', 'Review Your Skill')}</Title>

      <ReviewSection label={t('skills.form.name', 'Name')}>
        {values?.name || '—'}
      </ReviewSection>

      <ReviewSection label={t('skills.form.description', 'Description')}>
        <span className="whitespace-pre-wrap">{values?.description || '—'}</span>
      </ReviewSection>

      <ReviewSection label={t('skills.form.category', 'Category')}>
        {values?.category || '—'}
      </ReviewSection>

      <ReviewSection label={t('skills.form.tags', 'Tags')}>
        {values?.tags?.length
          ? values.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
          : <Text className="text-gray-400 italic text-sm">—</Text>}
      </ReviewSection>

      <ReviewSection label={t('skills.form.visibility', 'Visibility')}>
        {values?.is_public ? t('skills.form.public', 'Public') : t('skills.form.private', 'Private')}
      </ReviewSection>

      <ReviewSection label={t('skills.form.steps', 'Steps')}>
        <ListPreview items={steps} />
      </ReviewSection>

      <ReviewSection label={t('skills.form.tools', 'Tools')}>
        <ListPreview items={tools} />
      </ReviewSection>

      <ReviewSection label={t('skills.form.constraints', 'Constraints')}>
        <ListPreview items={constraints} />
      </ReviewSection>

      <ReviewSection label="Copilot — Apply To">
        {values?.agent_settings?.copilot?.applyTo || '**/*'}
      </ReviewSection>

      <ReviewSection label="Cursor — Always Apply">
        {values?.agent_settings?.cursor?.alwaysApply
          ? t('common.yes', 'Yes')
          : t('common.no', 'No')}
      </ReviewSection>

      <ReviewSection label="Cursor — Globs">
        {values?.agent_settings?.cursor?.globs || '—'}
      </ReviewSection>
    </div>
  );
};

export default SkillFormStepReview;
