import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './styles/About.css';

const About: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('about.sections.intro.title'),
      image:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
      content: t('about.sections.intro.content'),
    },
    {
      title: t('about.sections.vision.title'),
      image:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80',
      content: t('about.sections.vision.content'),
    },
    {
      title: t('about.sections.coreValues.title'),
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
      content: t('about.sections.coreValues.content'),
    },
  ];

  return (
    <Box className="about-page">
      <Container maxWidth="lg">
        <Stack className="about-sections">
          {sections.map((section, index) => {
            const isReverse = index % 2 !== 0;

            return (
              <Grid
                key={section.title}
                container
                spacing={4}
                className="about-section"
              >
                {isReverse ? (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack className="about-section__content">
                        <Typography variant="h3" className="about-section__title">
                          {section.title}
                        </Typography>
                        <Typography variant="body1" className="about-section__text">
                          {section.content}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        component="img"
                        src={section.image}
                        alt={section.title}
                        className="about-section__image"
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        component="img"
                        src={section.image}
                        alt={section.title}
                        className="about-section__image"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack className="about-section__content">
                        <Typography variant="h3" className="about-section__title">
                          {section.title}
                        </Typography>
                        <Typography variant="body1" className="about-section__text">
                          {section.content}
                        </Typography>
                      </Stack>
                    </Grid>
                  </>
                )}
              </Grid>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default About;
