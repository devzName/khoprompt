/**
 * CompilationPreview — displays compiled skill output for a single agent.
 * Shows agent name header, pre-formatted output, copy and download buttons.
 */
import { useState } from 'react';
import { Button, Typography, notification } from 'antd';
import { CopyOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const AGENT_LABELS = {
  claude: 'Claude',
  copilot: 'GitHub Copilot',
  cursor: 'Cursor',
  codex: 'Codex',
  opencode: 'OpenCode',
};

const AGENT_FILE_NAMES = {
  claude: 'CLAUDE.md',
  copilot: '.github/copilot-instructions.md',
  cursor: '.cursorrules',
  codex: 'AGENTS.md',
  opencode: 'OPENCODE.md',
};

/**
 * @param {{ agent: string, output: string|null, loading?: boolean }} props
 */
const CompilationPreview = ({ agent, output, loading }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      notification.success({ message: t('skills.copied', 'Copied to clipboard'), placement: 'topRight', duration: 2 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notification.error({ message: t('common.error'), placement: 'topRight' });
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const fileName = AGENT_FILE_NAMES[agent] || `${agent}-skill.md`;
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.split('/').pop(); // use only filename part
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Text className="text-sm font-medium text-gray-500 dark:text-neutral-400">
          {AGENT_LABELS[agent] || agent}
          {AGENT_FILE_NAMES[agent] && (
            <span className="ml-2 font-mono text-xs opacity-60">{AGENT_FILE_NAMES[agent]}</span>
          )}
        </Text>
        <div className="flex gap-2">
          <Button
            size="small"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
            disabled={!output || loading}
          >
            {copied ? t('skills.copied', 'Copied') : t('skills.copy', 'Copy')}
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!output || loading}
          >
            {t('skills.download', 'Download')}
          </Button>
        </div>
      </div>

      {!output && !loading && (
        <div className="py-8 text-center text-gray-400 dark:text-neutral-500 text-sm">
          {t('skills.noCompilation', 'No compilation available for this agent.')}
        </div>
      )}

      {output && (
        <pre className="overflow-auto rounded-md border border-gray-200 dark:border-white/10
          bg-gray-50 dark:bg-white/[0.03] p-4 text-sm font-mono leading-relaxed
          text-gray-800 dark:text-neutral-200 whitespace-pre-wrap break-words max-h-[500px]">
          {output}
        </pre>
      )}
    </div>
  );
};

export default CompilationPreview;
