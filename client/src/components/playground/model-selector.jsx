/**
 * Dropdown for selecting an AI model from the free models list.
 */
import { Select } from 'antd';

const { Option } = Select;

const ModelSelector = ({ models = [], value, onChange, disabled = false }) => (
  <Select
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{ minWidth: 180 }}
    size="small"
    popupMatchSelectWidth={false}
  >
    {models.map((m) => (
      <Option key={m.id} value={m.id}>
        {m.name}
      </Option>
    ))}
  </Select>
);

export default ModelSelector;
