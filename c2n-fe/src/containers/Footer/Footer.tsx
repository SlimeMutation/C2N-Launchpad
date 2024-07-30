import { Row, Col } from 'antd';
import styles from './Footer.module.scss';
import { useResponsive } from '@src/hooks/useResponsive';

type FooterProds = {
}

export default function Footer(props: FooterProds) {
  const {
    isDesktopOrLaptop,
    isTabletOrMobile,
  } = useResponsive();

  return (
    <footer className={styles['footer']}>
      <Row className="main-content">
        <Col span={isDesktopOrLaptop ? 8 : 24} className="col-1">
          <div className="app-name">
            <div className={styles.logo}></div>
          </div>
        </Col>
        <Col span={isDesktopOrLaptop ? 5 : 23} offset={isDesktopOrLaptop ? 1 : 0} className="col-2">
          <h4>SOCIAL</h4>
          <Row>
            <Col span={isDesktopOrLaptop ? 24 : 12}>
              <a href="https://discord.gg/2uVUYy7N" target="_blank" rel="noreferrer">Discord</a>
            </Col>
          </Row>
        </Col>
        <Col span={isDesktopOrLaptop ? 5 : 23} className="col-3">
          <h4>TOKEN</h4>
          <Row>
            <Col span={isDesktopOrLaptop ? 24 : 12}>
              <a href="https://coinmarketcap.com/currencies" target="_blank" rel="noreferrer">CoinMarketCap</a>
            </Col>
          </Row>
        </Col>
        <Col span={isDesktopOrLaptop ? 5 : 23} className="col-4">
          <h4>HELP</h4>
          <Row>
            <Col span={isDesktopOrLaptop ? 24 : 12}>
              <a href="https://github.com/TechPlanB" target="_blank" rel="noreferrer">Github</a>
            </Col>
          </Row>
        </Col>
      </Row>
    </footer>
  )
}