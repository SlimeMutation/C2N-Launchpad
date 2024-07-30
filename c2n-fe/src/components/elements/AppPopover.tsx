import { Popover as Pop } from 'antd'

interface PopoverProps {
  content: any;
  children: any;
  className?: any;
  style?: any;
  wrap?: boolean;
  placement?: string;
}

export default function AppPopover (props:PopoverProps) {
  const content = <div style={{color:'#ffffff',cursor:'pointer'}}>
    {props.content}
  </div>
  return props.wrap ?
    (<Pop content={content} color={'#000000'} placement={props.placement as any||'top'}>
    <div style={{display: 'inline-block', width:'100%'}}>
      {props.children}
    </div>
    </Pop>)
    : (
    (<Pop content={content} color={'#000000'}>
      {props.children}
      </Pop>)
    )
}