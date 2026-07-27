import inquirer from "inquirer";
import chalk from "chalk";

export async function confirmAction(
  actionLabel: string,
  preview: string
): Promise<boolean> {
  console.log(chalk.yellow(`\n⚠ ${actionLabel}`));
  console.log(preview);

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: "Proceed?",
      default: false,
    },
  ]);

  return confirmed;
}