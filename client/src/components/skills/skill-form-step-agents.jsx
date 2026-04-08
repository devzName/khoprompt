/**
 * Step 3 of skill form wizard: Agent-specific settings.
 * Copilot applyTo glob, Cursor alwaysApply + globs.
 */
import { Form, Input, Switch, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const SkillFormStepAgents = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      {/* Copilot settings */}
      <div className="border border-gray-200 dark:border-white/10 rounded-md p-4 flex flex-col gap-3">
        <Text className="text-sm font-semibold">GitHub Copilot</Text>
        <Form.Item
          name={['agent_settings', 'copilot', 'applyTo']}
          label={t('skills.form.copilotApplyTo', 'Apply To (glob)')}
          initialValue="**/*"
        >
          <Input placeholder="**/*" />
        </Form.Item>
      </div>

      {/* Cursor settings */}
      <div className="border border-gray-200 dark:border-white/10 rounded-md p-4 flex flex-col gap-3">
        <Text className="text-sm font-semibold">Cursor</Text>
        <Form.Item
          name={['agent_settings', 'cursor', 'alwaysApply']}
          label={t('skills.form.cursorAlwaysApply', 'Always Apply')}
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name={['agent_settings', 'cursor', 'globs']}
          label={t('skills.form.cursorGlobs', 'Globs')}
        >
          <Input placeholder="e.g. **/*.ts, **/*.js" />
        </Form.Item>
      </div>
    </div>
  );
};

export default SkillFormStepAgents;
