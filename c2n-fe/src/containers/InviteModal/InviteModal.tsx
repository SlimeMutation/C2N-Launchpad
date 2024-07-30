import { Row, Col, Modal } from 'antd';
import { TelegramShareButton, TwitterShareButton, TwitterIcon, TelegramIcon } from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';
import { CopyOutlined } from '@ant-design/icons';

import { useMessage } from '@src/hooks/useMessage';

import styles from './InviteModal.module.scss'
import { IconCopy } from '@src/components/icons';

type InviteModalProps = { visible, onCancel, url, projectName }

export default function InviteModal(props: InviteModalProps) {
    const { visible, onCancel, url, projectName } = props;
    const {
        setSuccessMessage,
    } = useMessage();

    return <Modal
        title={<div className={styles['modal-title']}>My referral link</div>}
        visible={visible}
        onCancel={onCancel}
        footer={null}
    >
        <Row justify='center' gutter={[24, 24]}>
            <Col span={24} offset={0} style={{ fontSize: '16px' }}>
                You can invite your friends to scan your referral code or copy and paste your referral link to join the project. One successfully registered the project would count as a VALID referee. You can earn 10 shares for each referee and the maximum referral system could reach 50 shares. Come and join C2N hottest IDO projects!
                <br />
                <b>Note:</b> You can also click the TG and Twitter symbol to share referral invitation.
            </Col>
            <Col span={24} style={{ textAlign: 'center' }}>
                <QRCodeSVG value={url} style={{ width: '160px', height: '160px' }}></QRCodeSVG>
            </Col>
            <Col span={24} style={{ textAlign: 'center' }}>
                <TelegramShareButton
                    className={styles['share-button']}
                    url={url}
                    title={`Come to join ${projectName} IDO & AIRDROP on C2N launchpad, BOBA- native, community governed NFT marketplace, exploring BOBA NFT here!`}>
                    <TelegramIcon style={{ borderRadius: '50%' }}></TelegramIcon>
                </TelegramShareButton>
                <TwitterShareButton
                    className={styles['share-button']}
                    style={{ marginLeft: '2em' }}
                    url={url}
                    title={`Come to join ${projectName} IDO & AIRDROP on C2N launchpad, BOBA- native, community governed NFT marketplace, exploring BOBA NFT here👉`}>
                    <TwitterIcon style={{ borderRadius: '50%' }}></TwitterIcon>
                </TwitterShareButton>
            </Col>
            <Row justify='start'>
                <Col span={2} offset={1}>
                    <CopyToClipboard text={url} onCopy={() => { setSuccessMessage('Copied.') }}>
                        <IconCopy style={{ cursor: 'pointer' }}></IconCopy>
                    </CopyToClipboard>
                </Col>
                <Col span={18}>
                    <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                        {url}
                    </div>
                </Col>
            </Row>
        </Row>
    </Modal>
}