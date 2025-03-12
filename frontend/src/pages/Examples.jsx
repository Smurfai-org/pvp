import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Tag from "../components/Tag";
import Hyperlink from "../components/Hyperlink";
import Toggle from "../components/Toggle";
import { TextBox } from "../components/textBox/TextBox";
import { SearchBar } from "../components/SearchBar";
import Dropdown from "../components/Dropdown";
import Card from "../components/Card";
import CategorySelector from "../components/CategorySelector";

function Examples() {
  return (
    <>
      <Button extra="small">Primary button</Button>
      <Button>Primary button</Button>
      <Button extra="large">Primary button</Button>

      <Button extra="small bright">Primary button</Button>
      <Button extra="bright">Primary button</Button>
      <Button extra="large bright">Primary button</Button>

      <Button extra="small secondary">Primary button</Button>
      <Button extra="secondary">Primary button</Button>
      <Button extra="large secondary">Primary button</Button>

      <Button extra="small disabled">Primary button</Button>
      <Button extra="disabled">Primary button</Button>
      <Button extra="large disabled">Primary button</Button>

      <Checkbox>Click me!</Checkbox>
      <Tag count={100}>taaag</Tag>
      <Hyperlink href="#">Hyperlink</Hyperlink>
      <Toggle>Click me!</Toggle>

      <TextBox />
      <TextBox errorText="Error message" />

      <SearchBar />
      <Dropdown />
      <Card />
      <CategorySelector />
    </>
  );
}

export default Examples;
