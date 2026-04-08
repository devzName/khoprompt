/**
 * 4-step wizard form for creating/editing a skill.
 * Steps: Basic Info → Spec → Agent Settings → Review
 */
import { useState } from 'react';
import { Form, Steps, Button, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import SkillFormStepBasic from './skill-form-step-basic';
import SkillFormStepSpec from './skill-form-step-spec';
import SkillFormStepAgents from './skill-form-step-agents';
import SkillFormStepReview from './skill-form-step-review';

const STEP_COUNT = 4;

/**
 * @param {{ form: object, onFinish: (payload: object) => Promise<void>, loading: boolean, initialData?: object }} props
 */
const SkillForm = ({ form, onFinish, loading, initialData }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [steps, setSteps] = useState(initialData?.spec?.steps ?? ['']);
  const [tools, setTools] = useState(initialData?.spec?.tools ?? []);
  const [constraints, setConstraints] = useState(initialData?.spec?.constraints ?? []);

  const handleSpecChange = (field, value) => {
    if (field === 'steps') setSteps(value);
    else if (field === 'tools') setTools(value);
    else if (field === 'constraints') setConstraints(value);
  };

  const validateCurrent = async () => {
    try {
      await form.validateFields();
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    // Validate spec step: require at least one non-empty step
    if (current === 1) {
      const filled = steps.filter(s => s.trim());
      if (!filled.length) {
        notification.warning({
          message: t('skills.form.stepsRequired', 'At least one step is required'),
          placement: 'topRight',
        });
        return;
      }
    }
    if (current < 2) {
      const valid = await validateCurrent();
      if (!valid) return;
    }
    setCurrent(c => c + 1);
  };

  const handlePrev = () => setCurrent(c => c - 1);

  const handleSubmit = async () => {
    const filled = steps.filter(s => s.trim());
    if (!filled.length) {
      notification.warning({
        message: t('skills.form.stepsRequired', 'At least one step is required'),
        placement: 'topRight',
      });
      return;
    }
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category || '',
        tags: values.tags || [],
        is_public: values.is_public ?? false,
        spec: {
          version: '1.0',
          metadata: { name: values.name, description: values.description },
          steps: filled,
          tools: tools.filter(s => s.trim()),
          constraints: constraints.filter(s => s.trim()),
        },
        agent_settings: values.agent_settings || {},
      };
      await onFinish(payload);
    } catch {
      // validateFields will surface field errors automatically
    }
  };

  const stepItems = [
    { title: t('skills.form.stepBasic', 'Basic Info') },
    { title: t('skills.form.stepSpec', 'Spec') },
    { title: t('skills.form.stepAgents', 'Agents') },
    { title: t('skills.form.stepReview', 'Review') },
  ];

  const watchedValues = form.getFieldsValue(true);

  return (
    <div className="flex flex-col gap-6">
      <Steps current={current} items={stepItems} size="small" />

      <Form form={form} layout="vertical" className="flex flex-col gap-2">
        {current === 0 && <SkillFormStepBasic />}
        {current === 1 && (
          <SkillFormStepSpec
            steps={steps}
            tools={tools}
            constraints={constraints}
            onChange={handleSpecChange}
          />
        )}
        {current === 2 && <SkillFormStepAgents />}
        {current === 3 && (
          <SkillFormStepReview
            values={watchedValues}
            steps={steps}
            tools={tools}
            constraints={constraints}
          />
        )}
      </Form>

      <div className="flex justify-between pt-2">
        <Button onClick={handlePrev} disabled={current === 0}>
          {t('skills.form.prev', 'Previous')}
        </Button>
        {current < STEP_COUNT - 1 ? (
          <Button type="primary" onClick={handleNext}>
            {t('skills.form.next', 'Next')}
          </Button>
        ) : (
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {t('skills.form.submit', 'Submit')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillForm;
