"use client";

import { DemoProfile } from "@/lib/data/demo/types";
import { CharacterHeader } from "@/components/demo/CharacterHeader";
import { CVGallery } from "@/components/demo/CVGallery";
import { JobsList } from "@/components/demo/JobsList";
import { CoverLettersList } from "@/components/demo/CoverLettersList";
import { DemoCTA } from "@/components/demo/DemoCTA";
import { Footer } from "@/components/layout/Footer";

interface CharacterProfileClientProps {
    profile: DemoProfile;
}

export default function CharacterProfileClient({ profile }: CharacterProfileClientProps) {
    return (
        <>
            <CharacterHeader
                meta={profile.meta}
                completenessScore={profile.completenessScore}
                generationTimeMs={profile.generationTimeMs}
            />

            <main className="container mx-auto px-4 py-8">
                {/* CVs Section */}
                <CVGallery
                    cvs={profile.cvs}
                    characterName={profile.meta.shortName}
                    ragData={profile.rag}
                />

                {/* Jobs Section */}
                <JobsList
                    jobs={profile.jobs}
                />

                {/* Cover Letters Section */}
                <CoverLettersList
                    letters={profile.coverLetters}
                />

                {/* CTA */}
                <DemoCTA characterName={profile.meta.shortName} />
            </main>

            <Footer />
        </>
    );
}
