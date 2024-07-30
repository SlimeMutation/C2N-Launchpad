import LivePoolCard from '../../components/elements/LivePoolCard'
import styles from './LivePools.module.scss'
import Router from 'next/router'

import { Row, Col, Spin } from 'antd'

import { ProjectData } from '@src/types/ProjectData';
import { useAppSelector } from '@src/redux/hooks';

type PageLoaderProps = {
  className?: string;
  children?: any;
  data?: Array<ProjectData>;
}

export default function PageLoader(props: PageLoaderProps) {
  const pageLoading = useAppSelector(state => state.global.pageLoading);

  return (
    <>
      <Spin spinning={pageLoading}>
        {props.children}
      </Spin>
    </>
  )
}