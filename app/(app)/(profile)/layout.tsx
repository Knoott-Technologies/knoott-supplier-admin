const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-fit items-start justify-start flex flex-col bg-background">
      {children}
    </div>
  );
};

export default ProfileLayout;
