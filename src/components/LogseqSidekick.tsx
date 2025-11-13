import { IconSettings } from '@tabler/icons-react';
import styles from './logseq.module.scss';
import Browser from 'webextension-polyfill';
import { LogseqBlock } from './LogseqBlock';
import LogseqPageLink from './LogseqPage';

const LogseqSidekick = ({ graph, pages, blocks }) => {
  console.log('[Logseq DB Sidekick] Rendering with:', { graph, pages, blocks });
  console.log('[Logseq DB Sidekick] Blocks length:', blocks?.length);
  console.log('[Logseq DB Sidekick] Pages length:', pages?.length);

  const goOptionPage = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('[Logseq DB Sidekick] Gear icon clicked!');
    Browser.runtime.sendMessage({ type: 'open-options' })
      .then(() => console.log('[Logseq DB Sidekick] Options message sent'))
      .catch(err => console.error('[Logseq DB Sidekick] Options message error:', err));
  };

  const groupedBlocks = blocks.reduce((groups, item) => {
    const group = (groups[item.page.name] || []);
    group.push(item);
    groups[item.page.name] = group;
    return groups;
  }, {});

  const count = () => {
    return pages.length + blocks.length;
  };

  const blocksRender = () => {
    if (blocks.length === 0) {
      return <></>;
    }
    return (
      <div className={styles.blocks}>
        {Object.entries(groupedBlocks).map(([key, blocks], i) => {
          return <LogseqBlock key={key} blocks={blocks} graph={graph} />;
        })}
      </div>
    );
  };

  const pagesRender = () => {
    if (pages.length === 0) {
      return <></>;
    }
    return <div className={styles.pages}>
      {pages.map((page) => {
        if (!page) return null;
        return (
          <div key={page.uuid} className={styles.page}>
            <LogseqPageLink
              graph={graph}
              page={page}
            ></LogseqPageLink>
          </div>
        );
      })}
    </div>

  };

  return (
    <>
      <div className={styles.sidekickCardHeader}>
        <span>Graph: {graph}</span>
        <button
          onClick={goOptionPage}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Open settings"
        >
          <IconSettings size={24} />
        </button>
      </div>
      {count() === 0 ? (
        <span>
          Nothing here, Do some research with Logseq!{' '}
          <a href={`logseq://graph/${graph}`}>Go</a>
        </span>
      ) : (
        <>
          {pagesRender()}
          {blocksRender()}
        </>
      )}
    </>
  );
};

export default LogseqSidekick;
