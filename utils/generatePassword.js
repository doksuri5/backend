export const generatePassword = () => {
  const length = Math.floor(Math.random() * (20 - 8 + 1)) + 8; // 8에서 20 사이의 랜덤 길이
  const chars = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    number: "0123456789",
    special: "~!@#$%^&*()_+[]{}",
  };

  let password = "";
  const charTypes = Object.keys(chars);

  // 적어도 두 종류의 문자 타입을 포함하도록 보장
  const typesIncluded = new Set();
  while (typesIncluded.size < 2) {
    const type = charTypes[Math.floor(Math.random() * charTypes.length)];
    password += chars[type][Math.floor(Math.random() * chars[type].length)];
    typesIncluded.add(type);
  }

  // 나머지 길이를 랜덤하게 채움
  while (password.length < length) {
    const type = charTypes[Math.floor(Math.random() * charTypes.length)];
    password += chars[type][Math.floor(Math.random() * chars[type].length)];
  }

  // 비밀번호를 셔플하여 랜덤성을 높임
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
