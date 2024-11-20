import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model<{ name: string; count: number }> {
  }

  Foo.init({
    name: DataTypes.TEXT,
    count: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Foo',
    timestamps: true,
    paranoid: true,
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;

  const foo = await Foo.create({ name: 'TS foo', count: 0 })
  expect(await Foo.count()).to.equal(1);

  await foo.destroy();
  expect(await Foo.count()).to.equal(0);

  await Foo.increment(['count'], { where: { name: 'TS foo' } });

  const deletedFoo = await Foo.findOne({ paranoid: false });
  expect(deletedFoo!.dataValues.count).to.eq(0);
}
