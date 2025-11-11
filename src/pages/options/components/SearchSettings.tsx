import {
  Heading,
  Grid,
  Text,
  Checkbox,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';

import {
  getLogseqSidekickConfig,
  saveLogseqSidekickConfig,
  LogseqSidekickConfig,
} from '@/config';

export const SearchSettings = () => {
  const [logseqConfig, setLogseqConfig] = React.useState<LogseqSidekickConfig>();

  useEffect(() => {
    getLogseqSidekickConfig().then((config) => {
      setLogseqConfig(config);
    });
  }, []);

  const handleExcludeJournalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setLogseqConfig({
      ...logseqConfig,
      excludeJournalPages: newValue,
    });
    await saveLogseqSidekickConfig({ excludeJournalPages: newValue });
  };

  return (
    <>
      <Heading size={'lg'}>Search Settings</Heading>
      <Grid gridTemplateColumns={'1fr'} rowGap={2}>
        <Checkbox
          isChecked={logseqConfig?.excludeJournalPages || false}
          onChange={handleExcludeJournalChange}
        >
          Exclude journal pages from search results
        </Checkbox>
        <Text fontSize="xs" color="gray.600" ml={6}>
          When enabled, search results from daily journal pages will be hidden.
          This can significantly reduce clutter when searching.
        </Text>
      </Grid>
    </>
  );
};
