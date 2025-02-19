import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Tag from "../components/Tag";
import Hyperlink from "../components/Hyperlink";
import Toggle from "../components/Toggle";

function Main() {
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
    </>
  );
}

export default Main;
